#!/bin/bash

ID=$1
NAME="lootbox$ID"
PORT="300$((ID - 1))"

RPC_DIR="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

LOOTBOX_DIR="$RPC_DIR/$NAME"

cat << EOF
[program:lootbox$ID]
directory=$LOOTBOX_DIR
command=/usr/local/bin/reach rpc-server
environment=REACH_DEBUG=1,REACH_CONNECTOR_MODE=ALGO-live,REACH_RPC_PORT=$PORT
autostart=true
autorestart=true
stderr_logfile=/var/log/$NAME.err.log
stdout_logfile=/var/log/$NAME.out.log
EOF
