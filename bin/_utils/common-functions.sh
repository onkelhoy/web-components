#!/bin/bash

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

# example: output=$(get_network_data 10 "npm search --searchlimit=100 @papit --json")
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