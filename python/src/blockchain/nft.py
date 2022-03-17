import json

from algosdk import mnemonic, account
from algosdk.future.transaction import AssetConfigTxn
from algosdk.v2client import algod

from .util import wait_for_confirmation, print_created_asset, print_asset_holding
from env import ALGO_MNEMONIC, ALGOD_TOKEN, ALGOD_ADDRESS, MODEL_MIMETYPE

BASE_UNIT_NAME = 'META'
BASE_ASSET_NAME = 'Metapunk'
BASE_DESCRIPTION = 'A H U E N'

private_key = mnemonic.to_private_key(ALGO_MNEMONIC)
public_key = account.address_from_private_key(private_key)

algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS,
                                 headers={'User-Agent': 'py-algorand-sdk', 'X-API-Key': ALGOD_TOKEN})


def create_nft(num: int, image_url: str, model_url: str, attrs_json) -> str:
    print(f'Creating NFT {image_url}')
    print(algod_client.status())

    nft_metadata = {
        'standard': 'arc69',
        'external_url': f'https://app.metapunks.world/metapunk/{num}',
        'media_url': model_url,
        'mime_type': MODEL_MIMETYPE,
        'attributes': attrs_json
    }
    print(f'Metadata: {nft_metadata}')

    params = algod_client.suggested_params()
    txn = AssetConfigTxn(
        sender=public_key,
        sp=params,
        total=1,
        default_frozen=False,
        unit_name=f'{BASE_UNIT_NAME}{num}',
        asset_name=f'{BASE_ASSET_NAME} #{num}',
        note=json.dumps(nft_metadata),
        manager=public_key,
        reserve=None,
        freeze=None,
        clawback=None,
        strict_empty_address_check=False,
        url=image_url,
        decimals=0
    )

    stxn = txn.sign(private_key)

    txid = algod_client.send_transaction(stxn)
    print(f'Asset Creation Transaction ID: {txid}')

    wait_for_confirmation(algod_client, txid, 4)

    ptx = algod_client.pending_transaction_info(txid)
    asset_id = ptx['asset-index']
    print_created_asset(algod_client, public_key, asset_id)
    print_asset_holding(algod_client, public_key, asset_id)

    return asset_id
