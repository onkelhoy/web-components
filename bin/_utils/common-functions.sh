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