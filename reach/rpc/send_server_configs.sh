#!/bin/bash

RPC_DIR=$(dirname "$0")
REPO_DIR=$(cd "$RPC_DIR"/../.. && pwd)

for i in {1..8}
do
  PORT="300$((i - 1))"
  python3 "$REPO_DIR"/python/src/setup_rpc_server.py $PORT
done
