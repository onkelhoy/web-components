#!/bin/bash

# start by exposing global flag 
export GLOBAL_PUBLISH=true
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(pwd)

if [ -f "$ROOTDIR/bin/version/.config" ]; then
  rm "$ROOTDIR/bin/version/.config"
fi 

touch "$ROOTDIR/bin/version/.config"
touch "$ROOTDIR/bin/version/.json"
echo "GLOBAL_PUBLISH=\"true\"" >> "$ROOTDIR/bin/version/.config"

# Check each argument
for arg in "$@"; do
  if [ "$arg" == "--ci" ]; then
    CI=1
  elif [ "$arg" == "--skip-semantic" ]; then 
    SKIP_SEMANTIC=true
    echo "SKIP_SEMANTIC=\"true\"" >> "$ROOTDIR/bin/version/.config"
  elif [ "$arg" == "--force" ]; then
    export FORCE=true
    echo "FORCE=\"true\"" >> "$ROOTDIR/bin/version/.config"
  elif [ "$arg" == "--verbose" ]; then
    export VERBOSE=true
    echo "VERBOSE=\"true\"" >> "$ROOTDIR/bin/version/.config"
  elif [ "$arg" == "--react" ]; then
    export REACT=true
    echo "REACT=\"true\"" >> "$ROOTDIR/bin/version/.config"
  fi
done

# If the flag is set, run the command
if [[ -z "$CI"  ]]; then
  if [[ $SKIP_SEMANTIC == false ]]; then
    echo "Global semantic versioning?"
    echo "answer:"
    echo "[0] none"
    echo "[1] patch"
    echo "[2] minor"
    echo "[3] major"

    read -p "Enter the number corresponding to your choice: " choice
    export SEMANTIC_VERSION="$choice"
  else 
    export SEMANTIC_VERSION=0
  fi
else
  # clean cache on pipeline
  npm cache clean --force 

  export SEMANTIC_VERSION=0
  export ROOTDIR=$(pwd)
  export NPM_TOKEN=$NPM_TOKEN
fi

export INDIVIDUAL_SCRIPT="$SCRIPTDIR/individual.sh"

PROJECTSCOPE=$(node -pe "require('$ROOTDIR/package.json').name")
export PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')

npm search --searchlimit=100 @$PROJECTSCOPE --json | node $SCRIPTDIR/main.js

# last we run the npm install (as we skipped in all postversion scripts)
npm install

unset NPM_TOKEN

# cleanup
rm "$ROOTDIR/bin/version/.config"
rm "$ROOTDIR/bin/version/.json"

echo "packages built"
