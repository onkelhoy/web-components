#!/bin/bash

export PACKAGE_PATH=$1
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(npm prefix)

# get the package environment variables
source $PACKAGE_PATH/.config
source $SCRIPTDIR/.config

export TARGET_PACKAGE=$FULL_NAME

if [ "$TARGET_PACKAGE" == "$INITIATOR" ]; then 
  echo "{\"initiator\": \"$INITIATOR\"}" > $SCRIPTDIR/.json
fi 

# execute the runner that will extract dependencies and update their package.json
node $SCRIPTDIR/main.js

if [ "$GLOBAL_PUBLISH" != "true" ] && [ "$TARGET_PACKAGE" == "$INITIATOR" ]; then 
  # let it cool down
  sleep 1

  # cleanup 
  rm $SCRIPTDIR/.config
  rm $SCRIPTDIR/.json
  
  # finally install it to affect lock file 
  npm install
  
  # rm -rf packages/*/*/node_modules

  echo "version-flud complete, initator: $INITIATOR"
fi