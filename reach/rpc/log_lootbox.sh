#!/bin/bash

LOOTBOX_ID=${1:-1}
tail /var/log/lootbox"$LOOTBOX_ID".out.log -f
