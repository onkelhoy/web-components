#!/bin/bash

CREATING=false

# Array to hold subfolder names
declare -a SUBFOLDERS

if [ -d "$ROOTDIR/packages"/*/ ]; then 
  # Counter for displaying options
  COUNTER=1

  echo "Available subfolders:"

  # Iterate over each subfolder in the parent directory
  for SUBFOLDER in "$ROOTDIR/packages"/*/; do
    # Check if it's a directory
    if [[ -d "$SUBFOLDER" ]]; then
      # Remove trailing slash and get folder name
      LAYER_FOLDER=$(basename "$SUBFOLDER")
      # Add to array
      SUBFOLDERS+=("$LAYER_FOLDER")
      # Print option for user
      echo "[$COUNTER]: $LAYER_FOLDER"
      COUNTER=$((COUNTER + 1))
    fi
  done
  echo ""

  # Prompt user for choice
  read -p "choose a layer [number] or enter a new name: " USER_CHOICE
else 
  # Prompt user for choice
  read -p "provide new layer name: " USER_CHOICE
fi 

echo ""
if [[ $USER_CHOICE -ge 1 && $USER_CHOICE -le ${#SUBFOLDERS[@]} ]]; then
  # Valid choice from the list
  LAYER_FOLDER="${SUBFOLDERS[$((USER_CHOICE-1))]}"

  echo "You choose: $LAYER_FOLDER"
else
  CREATING=true
  # New name provided & fix empty spaces
  LAYER_FOLDER=$(echo "$USER_CHOICE" | tr ' ' '-')
  read -p "override layer-name ($LAYER_FOLDER): " LAYER_NAME

  if [ -z "$LAYER_NAME" ]; then 
    LAYER_NAME="$LAYER_FOLDER"
    echo "layer-name remains same: $LAYER_NAME"
  else 
    echo "layer-name was changed to: $LAYER_NAME"
  fi 

  # fix empty spaces
  LAYER_NAME=$(echo "$LAYER_NAME" | tr ' ' '-')

  echo ""
  read -p "include-layer-name in package? [1/0]: " LAYER_INCLUDE
  if [ "$LAYER_INCLUDE" == "1" ]; then
    LAYER_INCLUDE=true
  else 
    LAYER_INCLUDE=false
  fi

  TARGET_FOLDER="$ROOTDIR/packages/$LAYER_FOLDER"

  echo ""
  echo "layer-folder: $LAYER_FOLDER"
  echo "layer-name: $LAYER_NAME"
  echo "include-layer-name: $LAYER_INCLUDE\n"
  echo ""

  echo "confirm creating of new layer"
  read -p "at: [$TARGET_FOLDER] [1/0]: " confirm_folder
  if [ "$confirm_folder" == "0" ]; then
    echo "you choose to abort ❎" 
    echo "EXIT=true" >> $TARGET_FOLDER/.config
    exit 1
  fi 

  # init folder and config file 
  mkdir $TARGET_FOLDER
  touch $TARGET_FOLDER/.config

  echo "LAYER_FOLDER=$LAYER_FOLDER" >> $TARGET_FOLDER/.config
  echo "LAYER_NAME=$LAYER_NAME" >> $TARGET_FOLDER/.config
  echo "LAYER_INCLUDE=$LAYER_INCLUDE" >> $TARGET_FOLDER/.config

  echo "\nlayer successfully created ✅" 
  echo ""
fi

TARGET_FOLDER=$ROOTDIR/packages/$LAYER_FOLDER
echo "TARGET_FOLDER=$TARGET_FOLDER" >> $SCRIPTDIR/package/.tmp

# now we have TARGET_FOLDER
if [[ ! -f "$TARGET_FOLDER/.config" ]]; then
  echo "[error] .config not found at: '$TARGET_FOLDER'"
  exit 1
fi 

# load the variables
source "$TARGET_FOLDER/.config"

# lets export the variables
echo "LAYER_FOLDER=$LAYER_FOLDER" >> $SCRIPTDIR/package/.tmp
echo "LAYER_NAME=$LAYER_NAME" >> $SCRIPTDIR/package/.tmp
echo "LAYER_INCLUDE=$LAYER_INCLUDE" >> $SCRIPTDIR/package/.tmp

echo "layer config loaded ~"
echo "- layer-name: $LAYER_NAME"
echo "- layer-folder: $LAYER_FOLDER"
echo "- include-layer-name: $LAYER_INCLUDE"
echo ""