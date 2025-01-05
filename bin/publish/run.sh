#!/bin/bash

# start by exposing global flag 
export GLOBAL_PUBLISH=true
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(pwd)

source $ROOTDIR/bin/_utils/common-functions.sh

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

# compute the list
bash "$ROOTDIR/bin/dependency-order/run.sh" --check-version
LIST=$(cat "$ROOTDIR/bin/dependency-order/list")

# Iterate over the list line by line
echo "$LIST" | while IFS=' ' read -r name package version changed; do
  # Access each part: $package, $version, and $changed
  if [[ $changed -eq 0 ]]; then 
    continue
  fi 

  echo "::group::$name 📦"

  cd "$package"
  # output=$(npm publish --access public --registry https://registry.npmjs.org/ --//registry.npmjs.org/:_authToken=${NPM_TOKEN} --verbose --dry-run)
  output=$(npm publish --access public --registry https://registry.npmjs.org/ --//registry.npmjs.org/:_authToken=${NPM_TOKEN} --verbose)

  while IFS= read -r line; do
    line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    if [[ -n "$group" ]] && [[ "$line" == "npm $group"* ]]; then
      echo "${line#npm $group }"
    else
      # Extract the group (the part after 'npm')
      if [[ "$line" =~ ^npm\ ([a-zA-Z0-9-]+)(.*) ]]; then
        if [[ -n "$group" ]]; then 
          echo "::endgroup::"
        fi
        group="${BASH_REMATCH[1]}"
        echo "::group::$group"
        echo "${BASH_REMATCH[2]}"
        
      else
        echo "$line"
      fi
    fi
  done <<< "$output" 

  echo "::endgroup::"
  sleep 1
done

unset NPM_TOKEN

# cleanup
rm "$ROOTDIR/bin/version/.config" &> /dev/null
rm "$ROOTDIR/bin/version/.json" &> /dev/null
rm "$ROOTDIR/bin/dependency-order/list" &> /dev/null