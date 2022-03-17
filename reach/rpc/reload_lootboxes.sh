#!/bin/bash

RPC_DIR=$(dirname "$0")
"$RPC_DIR"/setup_supervisor.sh
"$RPC_DIR"/reload_supervisor.sh
