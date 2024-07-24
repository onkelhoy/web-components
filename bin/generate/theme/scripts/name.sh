#!/bin/bash

function read_packagename() {
  read -p "enter theme-name: " NAME

  while [ -z "$NAME" ]; do
    echo "[error] must choose a theme name ❎"
    read -p "enter theme-name: " NAME
  done

  # fix empty spaces
  NAME=$(echo "$NAME" | tr ' ' '-')
  PACKAGE_NAME="$NAME"

  if [ "$LAYER_INCLUDE" == true ]; then 
    PACKAGE_NAME="$LAYER_NAME-$NAME"
  fi 

  FULL_NAME="@$PROJECTSCOPE/$PACKAGE_NAME"
}

function check_packagename() {
  if [ ! -f $ROOTDIR/package-lock.json ]; then 
    echo "2" 
    return 
  fi 

  exists=$(node -pe "!!require('$ROOTDIR/package-lock.json').packages['node_modules/$1'] ? 0 : 1")

  echo "$exists"
}

while true; do
  read_packagename
  check=$(check_packagename "$FULL_NAME")

  if [[ "$check" == "1" ]]; then
    break
  elif [[ "$check" == "2" ]]; then 
    echo ""
    echo "package-lock.json missing, cannot determine if package exists already: [$FULL_NAME]"
    read -p "would you like to continue anyway [1/0]: " continue_ans

    if [ $continue_ans == 1 ]; then 
      break
    else   
      echo "aborting ❎"
      exit 1
    fi 
  else
    echo "[error] theme '$FULL_NAME' already exists. Please choose another name."
    echo ""
  fi
done

echo "NAME=$NAME" >> "$SCRIPTDIR/theme/.tmp"
echo "PACKAGE_NAME=$PACKAGE_NAME" >> "$SCRIPTDIR/theme/.tmp"
echo "FULL_NAME=$FULL_NAME" >> "$SCRIPTDIR/theme/.tmp"

echo ""
echo "full-name: $FULL_NAME"
echo "name: $NAME"
echo "package-name: $PACKAGE_NAME"
echo ""