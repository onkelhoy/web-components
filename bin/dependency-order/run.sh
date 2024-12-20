#!/bin/bash

# basic variables 
export ROOTDIR=$(npm prefix)
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPTDIR/list" ]; then 
  rm "$SCRIPTDIR/list"
fi 

touch "$SCRIPTDIR/list"

source "$ROOTDIR/.config"
source "$ROOTDIR/bin/version/utils.sh"

# extract project-scope variable 
PROJECTSCOPE=$(node -e "
  const pkg = require('$ROOTDIR/package.json'); 
  console.log(pkg.name);
")

export PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')

# check flags 
for arg in "$@"; do
  # call script with all arguments 
  if [[ $arg == "--check-version" ]]; then
    export CHECKVERSION=1
  fi
done

if [ -n "$CHECKVERSION" ]; then 
  setupInitiator # this will setup with __SYSTEM__ as initiator 
fi 

node "$SCRIPTDIR/bash.js"