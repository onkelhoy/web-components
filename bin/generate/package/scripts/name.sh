#!/bin/bash

function read_packagename() {
  read -p "enter package-name: " NAME

  while [ -z "$NAME" ]; do
    echo "[error] must choose a package name ❎"
    read -p "enter package-name: " NAME
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
    echo "0" 
    return 
  fi 

  exists=$(node -pe "!!require('$ROOTDIR/package-lock.json').packages['node_modules/$1'] ? 0 : 1")

  echo "$exists"
}

while true; do
  read_packagename
  check=$(check_packagename "$FULL_NAME")

  echo "package exists - $check"

  if [[ "$check" == "1" ]]; then
    break
  else
    echo "[error] package '$FULL_NAME' already exists. Please choose another name."
    echo ""
  fi
done
CLASS_NAME=$(echo $PACKAGE_NAME | awk -F"[_-]" '{$1=toupper(substr($1,1,1))substr($1,2); for (i=2;i<=NF;i++){$i=toupper(substr($i,1,1))substr($i,2)}; print}' OFS="")

echo "NAME=$NAME" >> "$SCRIPTDIR/package/.tmp"
echo "PACKAGE_NAME=$PACKAGE_NAME" >> "$SCRIPTDIR/package/.tmp"
echo "FULL_NAME=$FULL_NAME" >> "$SCRIPTDIR/package/.tmp"
echo "CLASS_NAME=$CLASS_NAME" >> "$SCRIPTDIR/package/.tmp"

echo ""
echo "full-name: $FULL_NAME"
echo "name: $NAME"
echo "package-name: $PACKAGE_NAME"
echo "class-name: $CLASS_NAME"
echo ""