#!/bin/bash

NEW_NFTS_FILE="$1"

# WARNING
# Can't get a relative path here, run from ./python only
source ../.env

current_time=$(date "+%Y.%m.%d-%H.%M.%S")
shuffle_dir="$WORK_DIR/shuffles/$current_time"
mkdir -p "$shuffle_dir"

if [ "$ALGO_NETWORK" == "TESTNET" ]
then
  NAME_PREFIX="test_"
fi

mv "$WORK_DIR/$NAME_PREFIX$NFT_LIST_FILE" "$shuffle_dir"
mv "$WORK_DIR/$NAME_PREFIX$SHUFFLED_NFT_LIST_FILE" "$shuffle_dir"
mv "$WORK_DIR/$NAME_PREFIX$SHUFFLED_NFT_LIST_SIG_FILE" "$shuffle_dir"

cp "$NEW_NFTS_FILE" "$WORK_DIR/$NAME_PREFIX$NFT_LIST_FILE"
