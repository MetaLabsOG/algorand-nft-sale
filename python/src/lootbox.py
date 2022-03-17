import logging
import time

from async_timeout import timeout
from typing import List

from reach_rpc import mk_rpc
from .whitelist_manager import increase_limit
from .nft_manager import incr_cur_nft_num, shuffled_nfts
from .env import REACH_RPC_SERVER, REACH_RPC_KEY, REACH_RPC_TLS_REJECT_UNVERIFIED, ALGO_MNEMONIC, CONTRACT_TIMEOUT, PUBLIC_SALE
from python.src.util.log_util import log_event

logger = logging.getLogger(__name__)


def get_balance(rpc, acc):
    rpc('/stdlib/formatCurrency', rpc('/stdlib/balanceOf', acc))


def get_nfts(amount: int) -> List[int]:
    last_excl = incr_cur_nft_num(amount)
    logger.info(f'Next nft id is {last_excl}')
    res = shuffled_nfts[last_excl-amount: last_excl]
    return res

# This is a hack to conveniently disconnect from the smart contract.
# Probably can be handled in a more graceful way, but not sure how to do it.
class SuccessfullyPaidException(Exception):
    pass


async def fill_lootbox_contract(app_id: int, amount: int, buyer_address: str):
    logger.info(f'starting')

    rpc_port = f'300{amount - 1}'
    server = {
            'host': REACH_RPC_SERVER,
            'port': rpc_port,
            'key': REACH_RPC_KEY,
            'verify': REACH_RPC_TLS_REJECT_UNVERIFIED
        }
    logger.info(f'Connecting to:\n{server}')

    rpc, rpc_callbacks = mk_rpc(server)

    acc_sender = rpc('/stdlib/newAccountFromMnemonic', ALGO_MNEMONIC)
    logger.debug('Created account from mnemonic')

    ctc_lootbox = rpc('/acc/contract', acc_sender, app_id)

    log_event(f'Connected to lootbox contract', buyer_address, app_id)

    def seller():
        def log(info):
            log_event(info, buyer_address, app_id, "SMART CONTRACT")

        def inform_timeout(step):
            if not PUBLIC_SALE:
                increase_limit(buyer_address, amount)

            parsed_step = "UNKNOWN (code needs to be updated)"
            if step == 0:
                parsed_step = "PUBLISH ASA IDS"
            elif step == 1:
                parsed_step = "SEND NFTS TO CONTRACT"
            elif step == 2:
                parsed_step = "CLAIMER TIMEOUT"
                
            log_event(
                    f'Fill lootbox timed out at step {parsed_step}.',
                    buyer_address, app_id, "SMART CONTRACT", "WARNING"
                    )

        def get_nfts_participant():
            nft_ids = get_nfts(amount)
            log_event(
                    f'Lootbox was paid by user, sending nftIds {nft_ids} to contract',
                    buyer_address, app_id, "SMART CONTRACT"
                    )
            return nft_ids

        def disconnect():
            log_event(f'Sent {amount} to contract! but no DISCONNECT,SORRY BRO', buyer_address, app_id, "SMART CONTRACT")
            # raise SuccessfullyPaidException()

        return {
            'log': log,
            'informTimeout': inform_timeout,
            'getNfts': get_nfts_participant,
            'disconnect': disconnect
        }

    async def connect_to_contract():
        start_time = time.time()
        try:
            logger.info(rpc_callbacks('/backend/Seller', ctc_lootbox, seller()))
        except SuccessfullyPaidException:
            elapsed_time = time.time() - start_time
            log_event(
                    f"Succesfully sent NFTs to lootbox in {elapsed_time:.2f} seconds",
                    buyer_address, app_id
                    )
        except Exception as e:
            logger.error(e)
            raise

    async with timeout(int(CONTRACT_TIMEOUT)):
        await connect_to_contract()
