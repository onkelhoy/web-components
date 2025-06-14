#!/bin/bash

source .config
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(npm prefix)

if [[ -f "$SCRIPTDIR/start.js" ]]; then 
  node "$SCRIPTDIR/start.js"
elif [[ -f "$SCRIPTDIR/src/start.js" ]]; then
  node "$SCRIPTDIR/src/start.js"
fi