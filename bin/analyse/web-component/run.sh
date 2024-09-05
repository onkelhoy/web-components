#!/bin/bash

PACKAGEDIR=$1
SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source $PACKAGEDIR/.config 

# build ROOTDIR
ROOTDIR=$(npm prefix)

MAINCLASSNAME=$CLASSNAME

# Check each argument
for arg in "$@"; do
  if [ "$arg" == "--force" ]; then
    export FORCE=true
  fi
  if [ "$arg" == "--verbose" ]; then
    export VERBOSE=true
  fi
done

if [ -z "$PROJECTSCOPE" ]; then 
  # get project scope
  PROJECTSCOPE=$(node -pe "require('$ROOTDIR/package.json').name")
  PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')
  export PROJECTSCOPE
fi

# export for process.env (cleaner)
export SCRIPTDIR
export ROOTDIR

echo "[ANALYSE] 🎬 started  ------= $MAINCLASSNAME =------"

mkdir -p "$SCRIPTDIR/.temp/$ATOMICTYPE-$MAINCLASSNAME/output"

if [ ! -f "$SCRIPTDIR/.temp/initiator.env" ]; then 
  echo "INITIATOR=$MAINCLASSNAME" >> "$SCRIPTDIR/.temp/initiator.env"

  # TODO we should project a steamline of packages to be built and build each individually 
fi

source "$SCRIPTDIR/.temp/initiator.env"

if [ -f "$PACKAGEDIR/custom-elements.json" ]; then 
  # clear the file first
  rm $PACKAGEDIR/custom-elements.json
fi

# build a bundled script based on target 
if [ -z "$VERBOSE" ]; then 
  esbuild $PACKAGEDIR/src/register.ts --bundle --format=esm --outfile="$SCRIPTDIR/.temp/$ATOMICTYPE-$MAINCLASSNAME/analyse.bundle.js" --platform=browser &> /dev/null
else 
  esbuild $PACKAGEDIR/src/register.ts --bundle --format=esm --outfile="$SCRIPTDIR/.temp/$ATOMICTYPE-$MAINCLASSNAME/analyse.bundle.js" --platform=browser
fi

function generate_report () {
  local COMPONENT_FOLDER_PATH=$1
  local COMPONENT_PATH=$1
  local LEVEL=$2
  local CLASSNAME=$3

  if [ -z "$CLASSNAME" ]; then 

    if [ -f "$COMPONENT_PATH/index.ts" ]; then
      CLASSNAME=$(grep 'export class' "$COMPONENT_PATH/index.ts" | awk '{print $3}')
      COMPONENT_PATH="$COMPONENT_PATH/index.ts"
    else 
      echo "[ANALYSE] ❌ error - could not detect index.ts file \"$COMPONENT_PATH\""
    fi
  else 
    COMPONENT_PATH="$COMPONENT_PATH/component.ts"
  fi

  if [ ! -f "$COMPONENT_PATH" ]; then 
    echo "[ANALYSE] ❌ error - could not establish path \"$COMPONENT_PATH\""
    return 
  fi
  
  if [ -n "$CLASSNAME" ]; then 
    echo "[ANALYSE] 🔎 analyzing: \"$CLASSNAME\""

    node $SCRIPTDIR/extractor.js $CLASSNAME $COMPONENT_PATH $COMPONENT_FOLDER_PATH $LEVEL $PACKAGEDIR $MAINCLASSNAME $ATOMICTYPE
  else 
    echo "[ANALYSE] ❌ error - something went wrong trying to extract classname \"$COMPONENT_PATH\""
  fi 
}

if [ -d "$PACKAGEDIR/src/components" ]; then 
  find "$PACKAGEDIR/src/components" -mindepth 1 -maxdepth 1 -type d | while IFS= read -r dir; do
    generate_report $dir "sub"
  done
fi

generate_report "$PACKAGEDIR/src" "main" $MAINCLASSNAME

# now we need to combine each outputted json bundle into 1 
outputs=$(find "$SCRIPTDIR/.temp/$ATOMICTYPE-$MAINCLASSNAME/output" -mindepth 1 -maxdepth 1 -type f)

node $SCRIPTDIR/bundler.js $PACKAGEDIR $outputs

# cleanup
if [ "$INITIATOR" == "$MAINCLASSNAME" ]; then 
  rm -rf "$SCRIPTDIR/.temp"
fi 

echo "[ANALYSE] ✅ finished ------= $MAINCLASSNAME =------"
