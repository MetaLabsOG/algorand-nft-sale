import math
from algosdk import mnemonic, account
from algosdk.future.transaction import AssetTransferTxn, assign_group_id
from algosdk.v2client import algod

from .util import wait_for_confirmation, print_asset_holding
from ..env import ALGOD_TOKEN, ALGOD_ADDRESS

algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS, headers={'User-Agent': 'py-algorand-sdk', 'X-API-Key': ALGOD_TOKEN})

def ask_to_proceed():
    proceed = input("Do you want to continue? (y/n): ")
    while proceed not in ["y", "n"]:
        proceed = input("Do you want to continue? (y/n): ")
    if proceed != "y":
        exit(0)

def print_tx_info(tx: AssetTransferTxn):
    # also need group
    print(f"sender: {tx.sender}, receiver: {tx.receiver}, asa id: {tx.index}, group: {tx.group.hex()}")


def send_assets(asa_ids, to: str, ALGO_MNEMONIC: str):
    private_key = mnemonic.to_private_key(ALGO_MNEMONIC)
    public_key = account.address_from_private_key(private_key)
    print(algod_client.status())
    params = algod_client.suggested_params()

    print(f'Sending many metapunks: {len(asa_ids)}')
    
    send_size = 16
    number_of_batches = math.ceil(len(asa_ids) / send_size)

    def asset_tranfer_txn(asa_id: int):
        return AssetTransferTxn(sender=public_key, sp=params, receiver=to, amt=1, index=asa_id)

    for small_batch_index in number_of_batches:
        first_index = send_size * small_batch_index
        last_index = first_index + send_size

        tx_16_indexes = asa_ids[first_index:last_index]  # can actually have less that 16 transactions
        tx_16_batch = [asset_tranfer_txn(asa_id) for asa_id in tx_16_indexes]
        tx_16_batch_group = assign_group_id(tx_16_batch)
        tx_16_batch_group_signed = [txn.sign(private_key) for txn in tx_16_batch_group]

        print(f"You are going to send {len(tx_16_batch_group)} transactions:")
        for tx in tx_16_batch_group:
            print_tx_info(tx)

        ask_to_proceed()

        # send_transactions return first transaction id
        txid = algod_client.send_transactions(tx_16_batch_group_signed)
        print(f'First asset transfer transaction in batch: {small_batch_index}: {txid}')
        wait_for_confirmation(algod_client, txid, 4)


if __name__ == "__main__":
    print("Call sends_assets manually here")