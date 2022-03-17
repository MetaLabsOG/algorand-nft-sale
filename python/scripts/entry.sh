#!/bin/bash

set -e

ls

source .env

uvicorn src.app:app --host 0.0.0.0 --port "$SERVER_PORT" --workers "$WORKERS_NUM"
