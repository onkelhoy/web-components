#!/bin/bash

if [ -z "$NAME" ]; then 
  while true; do 
    echo ""
    read -p "enter name of component: " COMPONENT_NAME    

    COMPONENT_CLASS_NAME=$(echo $COMPONENT_NAME | awk -F"[_-]" '{$1=toupper(substr($1,1,1))substr($1,2); for (i=2;i<=NF;i++){$i=toupper(substr($i,1,1))substr($i,2)}; print}' OFS="")

    if [ -d "$PACKAGE_LOCATION/components/$COMPONENT_NAME" ]; then 
      echo "[warn] component [$COMPONENT_NAME] already exists, choose another name"
    else 
      break 
    fi
  done 
fi 

COMPONENT_FULL_NAME=$COMPONENT_NAME
# we have souced layer type so we can then include its prefix if necessary
if [ "$LAYER_INCLUDE" == "1" ]; then 
  COMPONENT_FULL_NAME="$LAYER_NAME-$COMPONENT_NAME"
fi 

echo "COMPONENT_FULL_NAME=$COMPONENT_FULL_NAME" >> "$SCRIPTDIR/component/.tmp"
echo "COMPONENT_CLASS_NAME=$COMPONENT_CLASS_NAME" >> "$SCRIPTDIR/component/.tmp"
echo "COMPONENT_NAME=$COMPONENT_NAME" >> "$SCRIPTDIR/component/.tmp"
