#!/bin/bash

echo "running monorepo project showcase generation"
export ROOTDIR=$(npm prefix)

excludes=()

for arg in "$@"; do
  if [[ $arg == --exclude=* ]]; then 
    excludes+=("${arg#*=}")
  fi 
done

echo "excludes: $excludes"