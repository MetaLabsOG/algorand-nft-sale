import asyncio
import logging
import time

from typing import List

from reach_rpc import mk_rpc

from python.src.env import REACH_RPC_SERVER, REACH_RPC_KEY, REACH_RPC_TLS_REJECT_UNVERIFIED, ALGO_MNEMONIC, CONTRACT_TIMEOUT


def get_balance(rpc, acc):
    rpc('/stdlib/formatCurrency', rpc('/stdlib/balanceOf', acc))


def fill_lootbox_contract(app_id: int, amount: int):
    print(f'starting')

    rpc_port = f'300{amount - 1}'
    server = {
            'host': REACH_RPC_SERVER,
            'port': rpc_port,
            'key': REACH_RPC_KEY,
            'verify': REACH_RPC_TLS_REJECT_UNVERIFIED
        }
    print(f'Connecting to:\n{server}')

    rpc, rpc_callbacks = mk_rpc(server)

    acc_sender = rpc('/stdlib/newAccountFromMnemonic', ALGO_MNEMONIC)
    print('Created account from mnemonic')

    ctc_lootbox = rpc('/acc/contract', acc_sender, app_id)

    print(f'Connected to lootbox contract?')

    def seller():
        def log(info):
            print("logging", info)

        def inform_timeout(step):
            parsed_step = "UNKNOWN (code needs to be updated)"
            if step == 0:
                parsed_step = "PUBLISH ASA IDS"
            if step == 1:
                parsed_step = "SEND NFTS TO CONTRACT"
            if step == 2:
                parsed_step = "THIS IS FRONTEND STEP, SHOULDNT BE HERE"
            print("oops, timeout:", parsed_step)

        def get_nfts():
            print("Get nft")
            return [0]

        def disconnect():
            print("disconnect")

        return {
            'log': log,
            'informTimeout': inform_timeout,
            'getNfts': get_nfts,
            'disconnect': disconnect
        }

    res = rpc_callbacks('/backend/Seller', ctc_lootbox, seller())
    print("Finished contract with", res)


if __name__ == "__main__":
    app_id = int(input("Enter app id:")) # e.g. 493233490
    amount = int(input("Enter amount to claim:"))
    fill_lootbox_contract(app_id, amount)
