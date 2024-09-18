#!/bin/bash

source $PACKAGE_LOCATION/.config 

echo ""
echo "[ANALYSE] 🎬 started  ------= $PACKAGE_NAME =------"

# build ROOTDIR
ROOTDIR=$(npm prefix)

# Check each argument
for arg in "$@"; do
  if [ "$arg" == "--verbose" ]; then
    export VERBOSE=true
    echo "verbose: true"
  fi
done

if [ -f "$PACKAGE_LOCATION/custom-elements.json" ]; then 
  # clear the file first
  rm $PACKAGE_LOCATION/custom-elements.json
fi

# generate_report "$PACKAGE_LOCATION/lib/style.css"

# cleanup
rm -rf "$SCRIPTDIR/.temp"

echo "[ANALYSE] ✅ finished ------= $PACKAGE_NAME =------"
