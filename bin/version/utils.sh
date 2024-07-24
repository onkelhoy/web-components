#!/bin/bash

SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# example: output=$(get_network_data 10 "npm search --searchlimit=100 @pap-it --json")
function get_network_data() {
  local timeout=$1
  shift
  local command="$*"
  local tmpfile=$(mktemp)

  # Execute the command and redirect output to the temporary file
  eval "$command" > "$tmpfile" 2>&1 &
  local pid=$!

  # Allow the command to run for up to the specified timeout
  local counter=0
  while [ $counter -lt $timeout ]; do
    sleep 1
    ((counter++))

    # Check if the process has completedj
    if ! kill -0 $pid 2>/dev/null; then
      break
    fi
  done

  # If the process is still running after the timeout, kill it
  if kill -0 $pid 2>/dev/null; then
    echo "__timeout__"
    kill $pid 2>/dev/null
  fi

  # Output the content of the temporary file and clean up
  cat "$tmpfile"
  rm "$tmpfile"
}

function get_npm_version_data() {
  local SCOPE=$1

  output=$(get_network_data 10 "npm search --searchlimit=100 @$SCOPE --json")
  if [ "$output" != "__timeout__" ]; then 
    # extracted=$(node -pe "JSON.parse(process.argv[1]).map(d => \`\${d.name}=\${d.version}\`).join('\n')" "$output_escaped")
    extracted=$(echo "$output" | node "$SCRIPTDIR/extract-npm.js")
    echo "$extracted"
    exit 0
  fi 

  echo "$output"
}

function safe_sed() {
  local input=$1 
  local file=$2
  # Check for OS and apply appropriate sed command
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS requires an empty string argument after -i
    sed -i '' $input $file
  else
    # Linux
    sed -i $input $file
  fi
}