#!/bin/bash

# region SETUP
############### START ###############
# clean up tmp & create it 
> "$SCRIPTDIR/theme/.tmp"
cleanup_run=false
cleanup() {
  if [ $cleanup_run == false ]; then 
    cleanup_run=true 
    echo ""
    echo "cleanup - generate:theme"
    rm "$SCRIPTDIR/theme/.tmp" &> /dev/null
  fi 
  exit
}
trap cleanup INT
trap cleanup EXIT

if [ ! -d "$ROOTDIR/packages/themes" ]; then 
  mkdir "$ROOTDIR/packages/themes"
  touch "$ROOTDIR/packages/themes/.config"

  echo "LAYER_FOLDER=themes" >> "$ROOTDIR/packages/themes/.config"
  echo "LAYER_NAME=theme" >> "$ROOTDIR/packages/themes/.config"
  echo "LAYER_INCLUDE=true" >> "$ROOTDIR/packages/themes/.config"
fi


# begin by getting the layer-name 
export LAYER_FOLDER=themes
export LAYER_NAME=theme
export LAYER_INCLUDE=true

PACKAGE_PREFIX=""
PROJECTLICENSE=$(node -pe "require('$ROOTDIR/package.json').license")

# now lets get the name for the theme 
bash "$SCRIPTDIR/theme/scripts/name.sh"
source "$SCRIPTDIR/theme/.tmp"
export NAME=$NAME
export PACKAGE_NAME=$PACKAGE_NAME
export FULL_NAME=$FULL_NAME

export destination="packages/themes/$NAME"
#endregion VARIABLES

# running copy and replace script 
bash $SCRIPTDIR/theme/scripts/copy.sh

# initialize theme 
cd "$destination" # in 
npm run init 
cd "$ROOTDIR"     # and out 

read -p "install theme? [1/0]: " confirm_install
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