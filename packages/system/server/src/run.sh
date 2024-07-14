#!/bin/bash

# variables
source .config
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(realpath $ROOTDIR_RELATIVE)
source "$ROOTDIR/.config"
loadcolors

# extracting flags
export LIVE=false
export VERBOSE=false
echo "flags:"
for arg in "$@"; do
  if [[ $arg == --port=* ]]; then 
    export PORT="${arg#*=}"
    echo "- port: $PORT"
  elif [[ $arg == --package=* ]]; then 
    export PACKAGE="${arg#*=}"
    echo "- package: $PACKAGE"
  elif [[ $arg == --view=* ]]; then 
    export VIEW="${arg#*=}"
    echo "- view: $VIEW"
  elif [[ $arg == --log-level=* ]]; then 
    export LOGLEVEL="${arg#*=}"
    echo "- log-level: $LOGLEVEL"
  elif [[ $arg == --live ]]; then 
    export LIVE=true
    echo "- live: true"
  elif [[ $arg == --verbose ]]; then 
    export LOGLEVEL="verbose"
    echo "- log-level: $LOGLEVEL"
    export VERBOSE=true
  elif [[ $arg == --CRITICAL ]]; then 
    export LOGLEVEL="CRITICAL"
    echo "- log-level: $LOGLEVEL"
    export CRITICAL=true
  fi 
done

if [[ $LIVE == false ]]; then 
  echo "- live: false"
fi 
if [[ $VERBOSE == false ]]; then 
  echo "- verbose: false"
fi 

echo ""

if [[ -z "$PACKAGE" ]]; then 
  logerror "package link not provided"
  exit 1
fi 
source "$PACKAGE/.config"

# NOTE this part needs changing to also allow for "non-view" folder 
if [[ -z "$VIEW" ]]; then 
  VIEW="$NAME"
fi

if [[ ! -d "$PACKAGE/views/$VIEW" ]]; then 
  logerror "view folder not found [$PACKAGE/views/$VIEW]"
  exit 1
fi 


export PACKAGEDIR=$PACKAGE
export VIEWDIR="$PACKAGE/views/$VIEW"
export AUTOSTART=true
mkdir "$VIEWDIR/.temp"

has_cleaned=false
function cleanup() {
  if [[ $has_cleaned == false ]]; then 
    has_cleaned=true
  else 
    echo ""
    exit 0
  fi 

  # run all necessary cleanups 
  kill $server_pid
  rm -rf "$VIEWDIR/.temp" 
  echo ""
}

# Trap to call cleanup function when the script receives a SIGINT (Ctrl+C)
trap cleanup SIGINT
trap cleanup EXIT

if [ -f "$SCRIPTDIR/bundle.js" ]; then 
  node "$SCRIPTDIR/bundle.js" & 
  server_pid=$!
elif [ -f "$SCRIPTDIR/src/index.js" ]; then
  node "$SCRIPTDIR/src/index.js" & 
  server_pid=$!
else 
  echo "ok nothing, $SCRIPTDIR"
fi

wait