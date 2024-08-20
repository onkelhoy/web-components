#!/bin/bash

if [ -z "$COMPONENT_TYPE" ]; then

  # Array to hold subfolder names
  declare -a SUBFOLDERS

  # Counter for displaying options
  COUNTER=1

  if [ $QUICK == false ]; then 
    echo ""
    echo "available package-types:"

    # Iterate over each subfolder in the parent directory
    for SUBFOLDER in "$SCRIPTDIR/component/template"/*/; do
      # Check if it's a directory
      if [[ -d "$SUBFOLDER" ]]; then
        # Remove trailing slash and get folder name
        COMPONENT_TYPE=$(basename "$SUBFOLDER")
        # Add to array
        SUBFOLDERS+=("$COMPONENT_TYPE")
        # Print option for user
        echo "[$COUNTER] $COMPONENT_TYPE"
        COUNTER=$((COUNTER + 1))
      fi
    done
    echo ""


    while true; do
      echo ""
      # Prompt user for choice
      read -p "choose a package-type by number: " USER_CHOICE
      
      if [[ $USER_CHOICE -ge 1 && $USER_CHOICE -le ${#SUBFOLDERS[@]} ]]; then
        # Valid choice from the list
        COMPONENT_TYPE="${SUBFOLDERS[$((USER_CHOICE-1))]}"

        echo "you chose: $COMPONENT_TYPE"
        break 
      else
        echo "[warn] you must select one of the options"
      fi 
    done 
  else 
    COMPONENT_TYPE="default"
  fi 
fi

echo "COMPONENT_TYPE=$COMPONENT_TYPE" >> "$SCRIPTDIR/component/.tmp"