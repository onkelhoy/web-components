#!/bin/bash

# variables
source .config
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(realpath $ROOTDIR_RELATIVE)
source "$ROOTDIR/.config"
loadcolors

# extracting flags
export LIVE=false
export PORT=3000
export LOGLEVEL="none"
export NOTFOUND="./template/notfound.html"
export DIRECTORY="./template/directory.html"
export COMMON="./template/common.html"
export WRAPPER="./template/wrapper.html"

for arg in "$@"; do
  if [[ $arg == --port=* ]]; then 
    export PORT="${arg#*=}"
  elif [[ $arg == --location=* ]]; then 
    export LOCATION="${arg#*=}"
  
  # Log Levels 
  elif [[ $arg == --log-level=* ]]; then 
    export LOGLEVEL="${arg#*=}"
  elif [[ $arg == --verbose ]]; then 
    export LOGLEVEL="verbose"
  elif [[ $arg == --critical ]]; then 
    export LOGLEVEL="critical"
  elif [[ $arg == --debug ]]; then 
    export LOGLEVEL="debug"
  elif [[ $arg == --live ]]; then 
    export LIVE=true
    
  # HTML templates 
  elif [[ $arg == --notfound=* ]] || [[ @arg == --404=* ]]; then 
    tmp="${arg#*=}"
    if [[ -f "$tmp" ]]; then
      export NOTFOUND=$tmp
    fi
  elif [[ $arg == --directory=* ]]; then 
    tmp="${arg#*=}"
    if [[ -f "$tmp" ]]; then
      export DIRECTORY=$tmp
    fi
  elif [[ $arg == --common=* ]]; then 
    tmp="${arg#*=}"
    if [[ -f "$tmp" ]]; then
      export COMMON=$tmp
    fi
  elif [[ $arg == --wrapper=* ]]; then 
    tmp="${arg#*=}"
    if [[ -f "$tmp" ]]; then
      export WRAPPER=$tmp
    fi
  fi 
done

# fixing log-level 
if [[ $LOGLEVEL == "verbose" ]]; then 
  export LOGLEVEL_VALUE=2
elif [[ $LOGLEVEL == "debug" ]]; then 
  export LOGLEVEL_VALUE=3
elif [[ $LOGLEVEL == "critical" ]]; then 
  export LOGLEVEL_VALUE=1
else 
  export LOGLEVEL="none"
  export LOGLEVEL_VALUE=0
fi

if [[ $LOGLEVEL_VALUE -gt 1 ]]; then
  echo "flags:"
  echo "- log-level: $LOGLEVEL"
  echo "- location: $LOCATION"
  echo "- port: $PORT"
  echo "- live: $LIVE"
  echo ""
fi 

if [[ -z "$LOCATION" ]]; then 
  echo "[\x1b[31merror] no location provided\x1b[0m"
  exit 1
fi 

# Initialize an empty array to store matched directories and their patterns
asset_dirs_arr=()

# Define the patterns you're searching for
asset_patterns=("public" "asset" "assets")

# iterate folder to root and find all public & asset folders
current_dir=$(realpath "$LOCATION")
while true; do

  # Check current directory
  for dir in $(ls "$current_dir"); do
    for pattern in "${asset_patterns[@]}"; do
      if [[ "$dir" == "$pattern" ]]; then
        asset_dirs_arr+=("$current_dir/$pattern")
      fi
    done

    if [[ "$dir" == "package.json" ]] && [[ -z "$PACKAGE" ]]; then 
      if [[ $LOGLEVEL == "debug" ]]; then
        echo "found package.json at: '$current_dir'"
      fi

      export PACKAGE="$current_dir"
    fi 
  done

  if [[ "$current_dir" == "$ROOTDIR" || "$current_dir" == "/" ]]; then
    break 
  fi 

  # move up one level 
  current_dir=$(dirname "$current_dir")
done 

# Export the array as a string
if [[ ${#asset_dirs_arr[@]} -gt 0 ]]; then
  export ASSET_DIRS="${asset_dirs_arr[*]}"
  
  if [[ $LOGLEVEL == "debug" ]]; then
    echo "\x1b[32mExported Assets\x1b[0m: $ASSET_DIRS"
    echo ""
  fi
fi

# this could be potentially set to false which would not start the server for unknown reason, 
# maybe if you would extend.. anyway I keep this like so for now 
export AUTOSTART=true

# in case :: like playwright sends SIGKILL instead of SIGTERM - no cleanup possible 
rm -rf "$LOCATION/.temp"
mkdir "$LOCATION/.temp"

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
  rm -rf "$LOCATION/.temp" 
  echo ""
}

# Trap to call cleanup function when the script receives a SIGINT (Ctrl+C)
trap cleanup SIGINT EXIT SIGTERM

if [[ -f "$SCRIPTDIR/bundle.js" ]]; then 
  node "$SCRIPTDIR/bundle.js" & 
  server_pid=$!
elif [[ -f "$SCRIPTDIR/src/index.js" ]]; then
  node "$SCRIPTDIR/src/index.js" & 
  server_pid=$!
elif [[ "$LOGLEVEL" == "debug" ]]; then
  echo "[\x1b[31merror] could not find server scripts\x1b[0m"
fi

wait