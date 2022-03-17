import logging
import os
import random
from datetime import datetime
from typing import List, Optional

from .util.io_util import read_int_list
from python.src.util.signer import sign, verify
from .db_manager import db
from .env import NFT_LIST_FILE, SHUFFLED_NFT_LIST_FILE, SHUFFLED_NFT_LIST_SIG_FILE, DB_NFT_CNT_KEY

logger = logging.getLogger(__name__)

# Init counter (or do nothing)
db.incr(DB_NFT_CNT_KEY, 0)


def get_cur_nft_num() -> int:
    return int(db.get(DB_NFT_CNT_KEY))


logger.debug(f'Current NFT number is {get_cur_nft_num()}')


def incr_cur_nft_num(amount: int) -> int:
    return db.incr(DB_NFT_CNT_KEY, amount)


def load_nft_list() -> Optional[List[int]]:
    if not os.path.isfile(NFT_LIST_FILE):
        logger.error(f'File {NFT_LIST_FILE} does not exist!')
        exit()
        return None

    with open(NFT_LIST_FILE) as f:
        return read_int_list(f)


def load_shuffled_nfts() -> Optional[List[int]]:
    if not os.path.isfile(SHUFFLED_NFT_LIST_FILE):
        logger.warning(f'File {SHUFFLED_NFT_LIST_FILE} does not exist!')
        return None

    if not os.path.isfile(SHUFFLED_NFT_LIST_SIG_FILE):
        logger.warning(f'File {SHUFFLED_NFT_LIST_SIG_FILE} does not exist!')
        return None

    verify(SHUFFLED_NFT_LIST_FILE, SHUFFLED_NFT_LIST_SIG_FILE)

    with open(SHUFFLED_NFT_LIST_FILE) as f:
        return read_int_list(f)


def shuffle_nfts() -> Optional[List[int]]:
    nfts = load_nft_list()
    if nfts is None:
        return None

    seed = datetime.now()
    logger.debug(f'Shuffle seed = {seed}')
    random.seed(seed)
    random.shuffle(nfts)

    with open(SHUFFLED_NFT_LIST_FILE, 'w') as f:
        f.write('\n'.join(str(nft_id) for nft_id in nfts))

    sign(SHUFFLED_NFT_LIST_FILE, SHUFFLED_NFT_LIST_SIG_FILE)

    return nfts


def get_shuffled_nfts() -> Optional[List[int]]:
    shuffled_nfts = load_shuffled_nfts()
    if shuffled_nfts is None:
        shuffled_nfts = shuffle_nfts()
    return shuffled_nfts


shuffled_nfts = get_shuffled_nfts()
if shuffled_nfts is None:
    logger.error('Could not load shuffled NFTs!')
    exit()
else:
    logger.debug(f'Loaded {len(shuffled_nfts)} NFTs:')
    for asa_id in shuffled_nfts:
        logger.debug(asa_id)

nfts_count = len(shuffled_nfts)


def nfts_left_count() -> int:
    return nfts_count - get_cur_nft_num()
