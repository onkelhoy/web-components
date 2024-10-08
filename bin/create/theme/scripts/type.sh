#!/bin/bash

if [ -z "$THEME_TYPE" ]; then

  # Array to hold subfolder names
  declare -a SUBFOLDERS

  # Counter for displaying options
  COUNTER=1

  echo ""
  echo "available theme-types:"

  # Iterate over each subfolder in the parent directory
  for SUBFOLDER in "$SCRIPTDIR/theme/templates"/*/; do
    # Check if it's a directory
    if [[ -d "$SUBFOLDER" ]]; then
      # Remove trailing slash and get folder name
      THEME_TYPE=$(basename "$SUBFOLDER")
      # Add to array
      SUBFOLDERS+=("$THEME_TYPE")
      # Print option for user
      echo "[$COUNTER] $THEME_TYPE"
      COUNTER=$((COUNTER + 1))
    fi
  done
  echo ""


  while true; do
    echo ""
    # Prompt user for choice
    read -p "choose a theme-type by number: " USER_CHOICE
    
    if [[ $USER_CHOICE -ge 1 && $USER_CHOICE -le ${#SUBFOLDERS[@]} ]]; then
      # Valid choice from the list
      THEME_TYPE="${SUBFOLDERS[$((USER_CHOICE-1))]}"

      echo "you chose: $THEME_TYPE"
      break 
    else
      echo "[warn] you must select one of the options"
    fi 
  done 
else 
  THEME_TYPE="default"
fi 

echo "THEME_TYPE=$THEME_TYPE" >> "$SCRIPTDIR/theme/.tmp"