import logging
import time
from os.path import join, dirname

import dotenv

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(asctime)s.%(msecs)03d][%(levelname)s] %(message)s",
    datefmt="%Y/%m/%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

dotenv_path = join(dirname(dirname(__file__)), '.env')

logger.debug(f'ENV file \'{dotenv_path}\'')
logger.debug(f'Server config:\n{dotenv.dotenv_values(dotenv_path)}')


def get(key: str):
    res = dotenv.get_key(dotenv_path, key)
    logger.debug(f'{key} = {res}')
    return res


# Common

ALGO_NETWORK = get('ALGO_NETWORK')
API_PASSWORD = get('API_PASSWORD')

RUN_ID = time.time()


# Selling

ALGO_SERVER = get(f'{ALGO_NETWORK}_ALGO_SERVER')
ALGO_PORT = get('ALGO_PORT')
ALGO_TOKEN = get(f'{ALGO_NETWORK}_ALGO_TOKEN')

ALGO_INDEXER_SERVER = get(f'{ALGO_NETWORK}_ALGO_INDEXER_SERVER')
ALGO_INDEXER_PORT = get('ALGO_INDEXER_PORT')
ALGO_INDEXER_TOKEN = get(f'ALGO_INDEXER_TOKEN')

CONTRACT_TIMEOUT = get('CONTRACT_TIMEOUT')

REACH_RPC_SERVER = get('REACH_RPC_SERVER')
REACH_RPC_KEY = get('REACH_RPC_KEY')
REACH_RPC_TLS_REJECT_UNVERIFIED = get('REACH_RPC_TLS_REJECT_UNVERIFIED')

NODE_PING_DELAY = 0.1


# NFTs

MAX_AMOUNT = 8

WORK_DIR = get('WORK_DIR')

NFT_NAME_PREFIX = '' if ALGO_NETWORK == 'MAINNET' else 'test_'
NFT_LIST_FILE = f'{WORK_DIR}/{NFT_NAME_PREFIX}{get("NFT_LIST_FILE")}'
SHUFFLED_NFT_LIST_FILE = f'{WORK_DIR}/{NFT_NAME_PREFIX}{get("SHUFFLED_NFT_LIST_FILE")}'
SHUFFLED_NFT_LIST_SIG_FILE = f'{WORK_DIR}/{NFT_NAME_PREFIX}{get("SHUFFLED_NFT_LIST_SIG_FILE")}'

PRIVATE_KEY_FILE = f'{WORK_DIR}/private_key.pem'
PUBLIC_KEY_FILE = f'{WORK_DIR}/public_key.pem'

REDIS_HOST = get('REDIS_HOST')
REDIS_PORT = get('REDIS_PORT')

DB_NFT_CNT_KEY = get(f'{ALGO_NETWORK}_DB_NFT_CNT_KEY')

WHITELIST_FILE = f'{WORK_DIR}/{get("WHITELIST_FILE")}'
WHITELIST_LIMIT = int(get('WHITELIST_LIMIT'))

NO_LIMITS = True
PUBLIC_SALE = True


# Minting

ARWEAVE_WALLET_PATH = get('ARWEAVE_WALLET_PATH')

ALGO_MNEMONIC = get(f'{ALGO_NETWORK}_ALGO_MNEMONIC')
ALGOD_TOKEN = get('ALGOD_TOKEN')
ALGOD_ADDRESS = get('ALGOD_ADDRESS')

IMAGE_EXT = 'png'
MODEL_EXT = 'glb'
IMAGE_MIMETYPE = 'image/png'
MODEL_MIMETYPE = 'model/gltf-binary'

IMAGES_DIR = get('IMAGES_DIR')
MODELS_DIR = get('MODELS_DIR')
ATTRS_DIR = get('ATTRS_DIR')


# Logs

AIRTABLE_API_KEY = get('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = get('AIRTABLE_BASE_ID')
AIRTABLE_TABLE_NAME = get('AIRTABLE_TABLE_NAME')
