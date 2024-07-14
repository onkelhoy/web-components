#!/bin/bash

# load variables
source $SCRIPTDIR/component/.tmp

echo ""
echo "name: $COMPONENT_NAME"
if [ -d "$ROOTDIR/bin/generate/component/template/$COMPONENT_TYPE/views" ]; then 
  echo "html-name: $COMPONENT_HTML_NAME"
fi 
echo "class-name: $COMPONENT_CLASS_NAME"
echo "full-name: $COMPONENT_FULL_NAME"
echo ""

if [ -z "$INITIAL_PACKAGE" ]; then 
  read -p "confirm creation of new component [1/0]: " confirm_component
  if [ "$confirm_component" == "0" ]; then
    echo "you choose to abort ❎" 
    exit 1
  fi 
fi

# copy over the src 
if [ "$INITIAL_PACKAGE" == true ]; then 
  mkdir "$PACKAGE_LOCATION/src"
  mkdir "$PACKAGE_LOCATION/test"

  TARGET_SRC="$PACKAGE_LOCATION/src"
  TARGET_TEST="$PACKAGE_LOCATION/test"
else
  # create folders 
  mkdir -p "$PACKAGE_LOCATION/src/components/$COMPONENT_NAME"
  mkdir -p "$PACKAGE_LOCATION/test/$COMPONENT_NAME"

  TARGET_SRC="$PACKAGE_LOCATION/src/components/$COMPONENT_NAME"
  TARGET_TEST="$PACKAGE_LOCATION/test/$COMPONENT_NAME"
fi

TARGET_VIEW="$PACKAGE_LOCATION/views/$COMPONENT_NAME"
mkdir -p "$PACKAGE_LOCATION/views/$COMPONENT_NAME"

# SOURCE 
rsync -a --exclude='*DS_Store' "$SCRIPTDIR/component/template/$COMPONENT_TYPE/src/" "$TARGET_SRC"

# VIEWS
if [ -d "$ROOTDIR/bin/generate/component/template/$COMPONENT_TYPE/views" ]; then 
  rsync -a --exclude='*DS_Store' "$SCRIPTDIR/component/template/$COMPONENT_TYPE/views/" "$TARGET_VIEW"
fi 

# TEST 
if [ -d "$SCRIPTDIR/component/template/$COMPONENT_TYPE/test" ]; then 
  rsync -a --exclude='*DS_Store' "$SCRIPTDIR/component/template/$COMPONENT_TYPE/test/" "$TARGET_TEST"
fi

# README
if [ -f "$SCRIPTDIR/component/template/$COMPONENT_TYPE/README.md" ]; then 
  cat "$SCRIPTDIR/component/template/$COMPONENT_TYPE/README.md" >> "$PACKAGE_LOCATION/README.md"
fi

# replace placeholders 
find "$PACKAGE_LOCATION" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_FULL_NAME#${COMPONENT_FULL_NAME}#g" {} \;
find "$PACKAGE_LOCATION" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_HTML_NAME#${COMPONENT_HTML_NAME}#g" {} \;
find "$PACKAGE_LOCATION" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_CLASS_NAME#${COMPONENT_CLASS_NAME}#g" {} \;
find "$PACKAGE_LOCATION" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_NAME#${COMPONENT_NAME}#g" {} \;
