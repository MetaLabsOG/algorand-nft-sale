#!/bin/bash

RPC_DIR=$(dirname "$0")

supervisorctl stop all
"$RPC_DIR"/../reach down
supervisorctl start all
