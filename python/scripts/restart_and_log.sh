#!/bin/bash

DIR=$(dirname "$0")

"$DIR"/restart.sh && "$DIR"/log_backend.sh
