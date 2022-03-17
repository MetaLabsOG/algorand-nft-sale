import sys

from reach_rpc import mk_rpc

from ..env import REACH_RPC_SERVER, REACH_RPC_KEY, REACH_RPC_TLS_REJECT_UNVERIFIED, ALGO_SERVER, ALGO_PORT, ALGO_TOKEN, \
    ALGO_INDEXER_SERVER, ALGO_INDEXER_PORT, ALGO_INDEXER_TOKEN


def setup_rpc(port: int):
    rpc_server = {
            'host': REACH_RPC_SERVER,
            'port': port,
            'key': REACH_RPC_KEY,
            'verify': REACH_RPC_TLS_REJECT_UNVERIFIED
        }

    print(f'Setting up:\n{rpc_server}')

    rpc, rpc_callbacks = mk_rpc(rpc_server)

    rpc('/stdlib/setProviderByEnv', {
        'ALGO_SERVER': ALGO_SERVER,
        'ALGO_PORT': ALGO_PORT,
        'ALGO_TOKEN': ALGO_TOKEN,
        'ALGO_INDEXER_SERVER': ALGO_INDEXER_SERVER,
        'ALGO_INDEXER_PORT': ALGO_INDEXER_PORT,
        'ALGO_INDEXER_TOKEN': ALGO_INDEXER_TOKEN,
        'REACH_ISOLATED_NETWORK': 'no'
    })


if __name__ == '__main__':
    setup_rpc(int(sys.argv[1]))
