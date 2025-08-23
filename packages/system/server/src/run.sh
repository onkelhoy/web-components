#!/bin/bash

if [ -f .config ]; then 
  source .config
else 
  echo "could not find .config"
fi 
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
  elif [[ $arg == --rootdir=* ]]; then 
    export ROOTDIR="${arg#*=}"
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
  echo "no location provided"
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
    echo "Exported Assets: $ASSET_DIRS"
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
  if [[ $has_cleaned == true ]]; then 
    return
  fi
  has_cleaned=true

  # Kill server if still running
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi

  # Remove temp folder
  if [[ -d "$LOCATION/.temp" ]]; then 
    rm -rf "$LOCATION/.temp"
  fi
}

if [[ $NOSIG == true ]]; then 
  trap cleanup EXIT
else 
  trap cleanup SIGINT SIGTERM EXIT
fi

if [[ -f "$SCRIPTDIR/bundle.js" ]]; then 
  node "$SCRIPTDIR/bundle.js" & 
  server_pid=$!
elif [[ -f "$SCRIPTDIR/src/index.js" ]]; then
  node "$SCRIPTDIR/src/index.js" & 
  server_pid=$!
elif [[ "$LOGLEVEL" == "debug" ]]; then
  echo "[error] could not find server scripts"
fi

# Export server PID for other scripts/tools
echo "SERVER_PID=$server_pid" >> "$LOCATION/.temp/.info"

# Sleep a bit to let server start
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
        echo "error xdg-open is not available, please install it to open URLs."
      fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
      # Windows (Cygwin, Git Bash, or Windows Subsystem for Linux)
      start "$URL"
    else
      echo "error unsupported OS: Cannot open URL automatically."
    fi
  fi 
fi 

# Only wait on server PID if it exists
if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
  wait "$server_pid" 2>/dev/null || true
fi
