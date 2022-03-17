#!/bin/bash

RPC_DIR=$(dirname "$0")
DELAY=10

while true
do
  echo "ping at $(date)"
  "$RPC_DIR"/send_server_configs.sh
  sleep $DELAY
done
