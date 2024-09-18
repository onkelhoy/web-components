#!/bin/bash

source .config
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOTDIR=$(npm prefix)

# extracting flags
export LIVE=false
export PORT=3000
export LOGLEVEL="none"
export NOTFOUND="./template/notfound.html"
export DIRECTORY="./template/directory.html"
export COMMON="./template/common.html"
export WRAPPER="./template/wrapper.html"

DOOPEN=false

for arg in "$@"; do
  if [[ $arg == --port=* ]]; then 
    export PORT="${arg#*=}"
  elif [[ $arg == --location=* ]]; then 
    export LOCATION="${arg#*=}"
  elif [[ $arg == --theme=* ]]; then 
    export THEME="${arg#*=}"
  elif [[ $arg == --open ]]; then 
    export DOOPEN=true
  elif [[ $arg == --nosig ]]; then 
    NOSIG=true
  elif [[ $arg == --output-translations=* ]]; then 
    export OUTPUT_TRANSLATIONS="${arg#*=}"
  elif [[ $arg == --output-translations && -z "$OUTPUT_TRANSLATIONS" ]]; then 
    export OUTPUT_TRANSLATIONS=true
  
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
        if [[ ! -f $current_dir/$dir/package.json ]]; then 
          # we dont want to add packages that has name of asset_patterns (like logicals/asset)
          asset_dirs_arr+=("$current_dir/$pattern")
        fi 
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
mkdir -p "$LOCATION/.temp/translations"
touch "$LOCATION/.temp/.info"

has_cleaned=false
function cleanup() {
  if [[ $has_cleaned == false ]]; then 
    has_cleaned=true
  else 
    echo ""
    exit 0
  fi 

  # run all necessary cleanups 
  if [[ -n "$server_pid" ]]; then
    kill $server_pid > /dev/null
  fi
  
  if [[ -d "$LOCATION/.temp" ]]; then 
    rm -rf "$LOCATION/.temp" 
  fi
  echo ""
}

if [[ $NOSIG == true ]]; then 
  trap cleanup EXIT
else 
  # Trap to call cleanup function when the script receives a SIGINT (Ctrl+C)
  trap cleanup SIGINT EXIT SIGTERM
fi 

if [[ -f "$SCRIPTDIR/bundle.js" ]]; then 
  node "$SCRIPTDIR/bundle.js" & 
  server_pid=$!
elif [[ -f "$SCRIPTDIR/src/index.js" ]]; then
  node "$SCRIPTDIR/src/index.js" & 
  server_pid=$!
elif [[ "$LOGLEVEL" == "debug" ]]; then
  echo "[\x1b[31merror] could not find server scripts\x1b[0m"
fi

echo "SERVER_PID=$server_pid" >> "$LOCATION/.temp/.info"
sleep 1

if [[ $DOOPEN == true ]]; then 
  source "$LOCATION/.temp/.info"

  if [[ -n "$PORT" ]]; then 
    # Define the URL you want to open
    URL="http://localhost:$PORT"

    # Detect the operating system and open the URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      open "$URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      # Linux
      if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL"
      else
        echo "[\x1b[33merror\x1b[0m] xdg-open is not available, please install it to open URLs."
      fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
      # Windows (Cygwin, Git Bash, or Windows Subsystem for Linux)
      start "$URL"
    else
      echo "[\x1b[33merror\x1b[0m] unsupported OS: Cannot open URL automatically."
    fi
  fi 
fi 

wait