import time

from algosdk import account, mnemonic
from algosdk.future.transaction import PaymentTxn
from algosdk.v2client import algod

from blockchain.util import wait_for_confirmation


def create_account():
    # Using Rand Labs Developer API
    # see https://github.com/algorand/py-algorand-sdk/issues/169
    # Change algod_token and algod_address to connect to a different client
    algod_token = "2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b"
    algod_address = "https://academy-algod.dev.aws.algodev.network/"
    algod_client = algod.AlgodClient(algod_token, algod_address)

    # Generate new account for this transaction
    secret_key, my_address = account.generate_account()
    m = mnemonic.from_private_key(secret_key)
    print("My address: {}".format(my_address))

    # Check your balance. It should be 0 microAlgos
    account_info = algod_client.account_info(my_address)
    print("Account balance: {} microAlgos".format(account_info.get('amount')) + "\n")

    # Fund the created account
    print(
        'Go to the below link to fund the created account using testnet faucet: \n https://dispenser.testnet.aws.algodev.network/?account={}'.format(
            my_address))

    completed = ""
    while completed.lower() != 'yes':
        completed = input("Type 'yes' once you funded the account: ");

    print('Fund transfer in process...')
    # Wait for the faucet to transfer funds
    time.sleep(10)

    print('Fund transferred!')
    # Check your balance. It should be 10000000 microAlgos
    account_info = algod_client.account_info(my_address)
    print("Account balance: {} microAlgos".format(account_info.get('amount')) + "\n")

    return m


def closeout_account(my_address, secret_key, algod_client):
    # build transaction
    print("Building transaction")
    params = algod_client.suggested_params()
    # comment out the next two (2) lines to use suggested fees
    params.flat_fee = True
    params.fee = 1000
    receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA"
    note = "closing out account".encode()

    # Fifth argument is a close_remainder_to parameter that creates a payment txn that sends all of the remaining funds to the specified address. If you want to learn more, go to: https://developer.algorand.org/docs/reference/transactions/#payment-transaction
    unsigned_txn = PaymentTxn(my_address, params, receiver, 0, receiver, note)

    # sign transaction
    print("Signing transaction")
    signed_txn = unsigned_txn.sign(secret_key)
    print("Sending transaction")
    txid = algod_client.send_transaction(signed_txn)
    print('Transaction Info:')
    print("Signed transaction with txID: {}".format(txid))

    # wait for confirmation
    try:
        print("Waiting for confirmation")
        wait_for_confirmation(algod_client, txid, 4)
    except Exception as err:
        print(err)
        return

    account_info = algod_client.account_info(my_address)
    print("Account balance: {} microAlgos".format(account_info.get('amount')) + "\n")


if __name__ == '__main__':
    print(create_account())
