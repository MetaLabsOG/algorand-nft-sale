import logging
from typing import Optional

from .env import WHITELIST_FILE, WHITELIST_LIMIT
from .db_manager import db


logger = logging.getLogger(__name__)


def increase_limit(address: str, amount: int) -> Optional[int]:
    if amount <= 0:
        logger.warning(f'Trying to increase limit for a negative amount {amount} for {address}')
        return None
    logger.info(f'Increasing limit for {address} by {amount}')
    return db.incr(address, amount)


def set_limit(address: str, amount: int) -> Optional[int]:
    if amount <= 0:
        logger.warning(f'Trying to set a negative limit {amount} for {address}')
        return None
    logger.info(f'Setting limit for {address} as {amount}')
    return db.set(address, amount)


def spend(address: str, amount: int) -> Optional[int]:
    if not can_spend(address, amount):
        return None

    logger.info(f'Spending limit for {address} with {amount}')
    return db.decrby(address, amount)


def get_limit(address: str) -> Optional[int]:
    res = db.get(address)
    return None if res is None else int(res)


def can_spend(address: str, amount: int) -> bool:
    limit = get_limit(address)
    return limit is not None and amount <= limit


def add_whitelist(filename: str):
    with open(filename) as f:
        lines = f.readlines()
        logger.info(f'Whitelist addresses:\n{lines}')
        for address in lines:
            set_limit(address.strip(), WHITELIST_LIMIT)


if __name__ == '__main__':
    add_whitelist(WHITELIST_FILE)
