#!/bin/bash

# region SETUP
############### START ###############
# clean up tmp & create it 
rm "$SCRIPTDIR/package/.tmp" &> /dev/null
touch "$SCRIPTDIR/package/.tmp"
cleanup_run=false
cleanup() {
  if [ $cleanup_run == false ]; then 
    cleanup_run=true 
    echo ""
    echo "cleanup - generate:package"
    rm "$SCRIPTDIR/package/.tmp" &> /dev/null
  fi 
  exit
}

if [ ! -d "$ROOTDIR/packages" ]; then 
  mkdir "$ROOTDIR/packages"
fi

trap cleanup INT
trap cleanup EXIT
############### END #################
#endregion SETUP

# region VARIABLES
############### START ###############
PACKAGE_PREFIX=""
PROJECTLICENSE=$(node -pe "require('$ROOTDIR/package.json').license")

read -p "would you like to use sub-layers? (default 1) [1/0]: " sublevels
if [ $sublevels == 1 ]; then 
  # begin by getting the layer-name 
  bash "$SCRIPTDIR/package/scripts/layer.sh"
  source "$SCRIPTDIR/package/.tmp"
  if [ "$EXIT" == true ]; then 
    exit 
  fi 

  export LAYER_FOLDER=$LAYER_FOLDER
  export LAYER_NAME=$LAYER_NAME
  export LAYER_INCLUDE=$LAYER_INCLUDE
fi 

# now lets get the name for the package 
bash "$SCRIPTDIR/package/scripts/name.sh"
source "$SCRIPTDIR/package/.tmp"
export NAME=$NAME
export PACKAGE_NAME=$PACKAGE_NAME
export FULL_NAME=$FULL_NAME
export CLASS_NAME=$CLASS_NAME

if [ -n "$TARGET_FOLDER" ]; then 
  export destination="$TARGET_FOLDER/$NAME"
else 
  export destination="$ROOTDIR/packages/$NAME"
fi 
############### END #################
#endregion VARIABLES

# running copy and replace script 
bash $SCRIPTDIR/package/scripts/copy.sh

# now its time to call in component script 
bash $SCRIPTDIR/component/run.sh "$destination" --package

read -p "install package? [1/0]: " confirm_install
if [ "$confirm_install" == "0" ]; then
  echo "you choose not to install" 
else 
  # installing the component 
  npm install
fi 

echo ""
read -p "git commit? [1/0]: " git_ans
if [ "$git_ans" == "0" ]; then
  echo "you choose not to commit"
else 
  git add $destination
  git commit -m "add: new $LAYER_NAME component : $NAME"
fi

echo ""
echo "$PACKAGE_NAME successfully created ✅"