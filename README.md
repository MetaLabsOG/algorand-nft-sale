# How to Run Sales

## Install dependencies
0. `reach $ npm install`
1. `react $ npm install`
2. Install docker-compose https://docs.docker.com/compose/install/
3. Install and run Redis https://redis.io/topics/quickstart
4. Install Reach and dependencies: https://docs.reach.sh/tut/rps/#tut-1
5. Install supervisord http://supervisord.org/
6. If you don't have systemd, install it. https://www.freedesktop.org/wiki/Software/systemd/ if you have troubles on mac, please contact us.

## Generate lootboxes
This is the code needed for frontend to process smart-contracts communication, as well as for backend to communicate with blockchain.

`reach $ ./build.sh`

It will generate code for 8 smart-contracts, each to sell from 1 to 8 (Algorand limitation) NFTs.

## Run backend

### Start RPC servers

You need to set variables in `python/.env` file to communicate with blockchain:
```commandline
TESTNET_ALGO_MNEMONIC=''
MAINNET_ALGO_MNEMONIC=''

ALGO_PORT=443
ALGO_INDEXER_PORT=443
ALGO_INDEXER_TOKEN=''
TESTNET_ALGO_SERVER='https://app.metapunks.world/node'
TESTNET_ALGO_TOKEN=''
TESTNET_ALGO_INDEXER_SERVER='https://algoindexer.testnet.algoexplorerapi.io'
MAINNET_ALGO_TOKEN=''
MAINNET_ALGO_SERVER='https://app.metapunks.world/main'
MAINNET_ALGO_INDEXER_SERVER='https://algoexplorerapi.io/idx2'
```

Then run the command to start 8 RPC servers for each lootbox.

`reach $ sudo rpc/reload_lootboxes.sh`

It will create `systemctl` services, which will run in the background and restart automatically on fail.

**Then you need to set up the servers to look at your desired algod server and indexer.**

There is a script `python/src/setup_rpc_server.py` which takes RPC server port as an argument and sends variables from your `.env` to the local RPC server on that port.

There is an easier way to do it:

` reach$ rpc/send_server_configs.sh`

This script will send the config with needed variables to all 8 RPC servers, assuming that they are running on ports 300{0..7}.

* To read logs of each lootbox run:

`reach $ rpc/log_lootbox.sh $lootbox_num`

* To stop servers:

`reach $ prune_servers.sh`

### Start backend server

Set env variables:

```commandline
ALGO_NETWORK=MAINNET
SERVER_PORT=5000
WORKERS_NUM=16
API_PASSWORD=''
```

Then to start the server:
```
python $ scripts/restart.sh

// To follow the logs
python $ scripts/restart_and_log.sh
```

## Run frontend
Run the React app on another port. 

`react $ PORT=8000 npm run`.

If you have problems with openssl, `NODE_OPTIONS=--openssl-legacy-provider npm run build` may help, but use at your own risk.

## Buy NFT
0. Go to (http://localhost:8000).
1. Connect you MyAlgoWallet or WalletConnect
2. Deploy lootbox [in Algorand terms].
3. Deploy lootbox [in Reach terms] and pay for it. Includes additional 0.1 ALGO which will be returned later.
4. Opt-in.
5. Claim NFT.
6. Delete lootbox smart-contract.

# Known issues
1. User gets an additional 0.1 ALGO (together with his 0.1 sent back) from sender. This is not currently fixable when using Reach+Algorand due to "dumb" fees estimation.
2. "Critical" security issues in some npm packages. We do not think that it is actual security problems given our architecture, but it is something you may want to evaluate yourself.

# Contact us
This guide could be not fully understandable or have some flaws. 
If you find mistake or don't find what you need and have a question, please contact us! By [email](mailto:x@metapunks.world) or in [Twitter](https://twitter.com/MetaPunksOG).
