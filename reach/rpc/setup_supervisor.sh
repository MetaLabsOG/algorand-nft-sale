#!/bin/bash

RPC_DIR="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
CONF_DIR="$RPC_DIR/conf"
mkdir -p "$CONF_DIR"

for i in {1..8}
do
  "$RPC_DIR"/gen_conf.sh $i > "$CONF_DIR"/lootbox$i.conf
done

cp "$CONF_DIR"/* /etc/supervisor/conf.d
