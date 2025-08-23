#!/bin/bash

source .config 
  
# create rootdir (now based on relative paths)
ROOTDIR=$(npm prefix)

source "$ROOTDIR/bin/version/utils.sh"

if [ -f "$ROOTDIR/bin/version/.config" ]; then 
  source "$ROOTDIR/bin/version/.config"
fi 

# we check if FORCE flag is set then we want to continue everything
if [ -n "$FORCE" ]; then 
  exit 0
fi

if [ -z "$INITIATOR" ]; then
  setupInitiator "$(pwd)"
fi 

check_version "$(pwd)"
status=$?

if [ $status -ne 0 ]; then 
  if [ $status -eq 1 ]; then 
    echo "[skip] $name is already updated"
  elif [ $status -eq 2 ]; then
    echo "[skip] $name is a new package"
  elif [ $status -eq 3 ]; then
    echo "[error] $name something went wrong"
  fi 
  echo ""

  # cleanup 
  if [ "$INITIATOR" == "$name" ]; then
    # cleanup
    rm "$ROOTDIR/bin/version/.config" &> /dev/null
    rm "$ROOTDIR/bin/version/.json" &> /dev/null
  fi 

  exit 3
else 
  exit 0
fi 