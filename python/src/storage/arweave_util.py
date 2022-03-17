import logging

from arweave.arweave_lib import Wallet, Transaction
from arweave.transaction_uploader import get_uploader

from ..env import ARWEAVE_WALLET_PATH

ARWEAVE_BASE_PATH = 'https://arweave.net'

logger = logging.getLogger(__name__)

wallet = Wallet(ARWEAVE_WALLET_PATH)


def upload_file(file_path: str, mimetype: str) -> str:
    print(f'Uploading {file_path} to Arweave...')

    with open(file_path, "rb", buffering=0) as file_handler:
        tx = Transaction(wallet, file_handler=file_handler, file_path=file_path)
        tx.add_tag('Content-Type', mimetype)
        tx.sign()

        uploader = get_uploader(tx, file_handler)

        while not uploader.is_complete:
            uploader.upload_chunk()
            #print(f'{uploader.pct_complete}% complete, {uploader.uploaded_chunks}/{uploader.total_chunks}')

        tx.send()

        link = f'{ARWEAVE_BASE_PATH}/{tx.id}'
        print(f"{file_path} successfully uploaded as {link}")

        return link
