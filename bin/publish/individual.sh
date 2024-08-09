#!/bin/bash

# init variables
PACKAGE=$1
REMOTE_VERSION=$2

# execute logic
cd $PACKAGE 
source $PACKAGE/.config

# Extract name and version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo "[version]: ⭐️ $CURRENT_VERSION"

# REMOVED: && [[ -n $NPM_TOKEN ]];
# as we want that pipeline can skip to run publish when version is same !! 
if [[ "$CURRENT_VERSION" == "$REMOTE_VERSION" ]] && [[ $FORCE != true ]]; then
  # skipped 
  echo "[individual]: skipped"
else 
  if [[ -n "$NPM_TOKEN" ]]; then 
    if [[ "$CAN_PUBLISH" == "true" ]]; then 
      # publish 
      npm publish --access public --registry https://registry.npmjs.org/ --//registry.npmjs.org/:_authToken=${NPM_TOKEN} --verbose
      
      # npm publish --access public --registry https://registry.npmjs.org/ --//registry.npmjs.org/:_authToken=${NPM_TOKEN} --verbose --dry-run
    else 
      echo "[individual]: skipped"
    fi 
  fi
fi


# we add this in to make sure to receive the npm version but for sake of build we still build it (but only when not pipeline)
if [[ "$CURRENT_VERSION" == "$REMOTE_VERSION" ]] && [[ -z $NPM_TOKEN ]] && [[ $SEMANTIC_VERSION != 0 ]]; then
  # skipped 
  echo "[individual]: skipped"
fi

echo "[individual]: complete"
