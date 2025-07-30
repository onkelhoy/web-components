#!/bin/bash

# load variables
source $SCRIPTDIR/component/.tmp

echo ""
echo "name: $COMPONENT_NAME"
if [ -d "$ROOTDIR/bin/create/component/template/$COMPONENT_TYPE/views" ]; then 
  echo "html-name: $COMPONENT_HTML_NAME"
fi 
echo "class-name: $COMPONENT_CLASS_NAME"
echo "full-name: $FULL_PACKAGE_NAME"
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

  TARGET_SRC="$PACKAGE_LOCATION/src"

  if [ -f "$SCRIPTDIR/component/template/$COMPONENT_TYPE/package.json" ]; then 
    rm "$PACKAGE_LOCATION/package.json" 
    cp "$SCRIPTDIR/component/template/$COMPONENT_TYPE/package.json" "$PACKAGE_LOCATION/package.json"

    # specific placeholder replacement 
    sed -i '' "s/GITNAME/${GITNAME}/g" $PACKAGE_LOCATION/package.json

    if [ -n $PROJECTLICENSE ]; then 
      sed -i '' "s/PROJECTLICENSE/${PROJECTLICENSE}/g" $PACKAGE_LOCATION/package.json
    fi
  fi 
else
  # create folders 
  mkdir -p "$PACKAGE_LOCATION/src/components/$COMPONENT_NAME"

  TARGET_SRC="$PACKAGE_LOCATION/src/components/$COMPONENT_NAME"
fi

TARGET_VIEW="$PACKAGE_LOCATION/views/$COMPONENT_NAME"

# SOURCE 
rsync -a --exclude='*DS_Store' --exclude='.gitkeep' "$SCRIPTDIR/component/template/$COMPONENT_TYPE/src/" "$TARGET_SRC"

# VIEWS
if [ -d "$ROOTDIR/bin/create/component/template/$COMPONENT_TYPE/views" ]; then 
  mkdir -p "$PACKAGE_LOCATION/views/$COMPONENT_NAME"
  rsync -a --exclude='*DS_Store' --exclude='.gitkeep' "$SCRIPTDIR/component/template/$COMPONENT_TYPE/views/" "$TARGET_VIEW"
fi 

# TEST 
if [ -d "$SCRIPTDIR/component/template/$COMPONENT_TYPE/tests" ]; then 
  TARGET_TEST="$PACKAGE_LOCATION/tests/$COMPONENT_NAME"
  rsync -a --exclude='*DS_Store' --exclude='.gitkeep' "$SCRIPTDIR/component/template/$COMPONENT_TYPE/tests/" "$TARGET_TEST"
fi

# README
if [ -f "$SCRIPTDIR/component/template/$COMPONENT_TYPE/README.md" ]; then 
  cat "$SCRIPTDIR/component/template/$COMPONENT_TYPE/README.md" >> "$PACKAGE_LOCATION/README.md"
fi

# replace placeholders 
find "$PACKAGE_LOCATION" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" | while read -r file; do 
  sed -i '' "s#PLACEHOLDER_FULL_NAME#${FULL_PACKAGE_NAME}#g" "$file"
  sed -i '' "s#PLACEHOLDER_PACKAGE_NAME#${COMPONENT_FULL_NAME}#g" "$file"
  sed -i '' "s#PLACEHOLDER_HTML_NAME#${COMPONENT_HTML_NAME}#g" "$file"
  sed -i '' "s#PLACEHOLDER_CLASS_NAME#${COMPONENT_CLASS_NAME}#g" "$file"
  sed -i '' "s#PLACEHOLDER_NAME#${COMPONENT_NAME}#g" "$file"
done

# cannot do this as we dont know which one is root.. 
# echo "COMPONENT_HTML_NAME=\"$COMPONENT_PREFIX$COMPONENT_FULL_NAME\"" >> "$PACKAGE_LOCATION/.config"
