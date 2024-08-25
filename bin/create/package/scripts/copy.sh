#!/bin/bash

function relative_path_to_ancestor() {
  local child_path="$1"
  local ancestor_path="$2"

  # Normalize paths to remove trailing slashes
  child_path="${child_path%/}"
  ancestor_path="${ancestor_path%/}"

  local relative_path=""
  while [[ "$child_path" != "$ancestor_path" && "$child_path" != "/" ]]; do
    relative_path="../${relative_path}"
    child_path=$(dirname "$child_path")
  done

  if [[ "$child_path" != "$ancestor_path" ]]; then
    echo "Error: The specified ancestor is not actually an ancestor of the child." >&2
    return 1
  fi

  # Output the relative path
  echo "$relative_path"
}

# create folder and copy over files 
mkdir "$destination"
rsync -a --exclude='*DS_Store' --exclude='.gitkeep' "$SCRIPTDIR/package/template/" "$destination"

# replace placeholders 
# layer info 
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/PLACEHOLDER_LAYER_NAME/${LAYER_NAME}/g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/PLACEHOLDER_LAYER_FOLDER/${LAYER_FOLDER}/g" {} \;
# package info
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_FULL_NAME#${FULL_NAME}#g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_PACKAGE_NAME#${PACKAGE_NAME}#g" {} \;
# main component
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_CLASS_NAME#${CLASS_NAME}#g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_NAME#${NAME}#g" {} \;
# github
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#PLACEHOLDER_GITHUB_REPO#${GITHUB_REPO}#g" {} \;

# specific placeholder replacement 
sed -i '' "s/GITNAME/${GITNAME}/g" $destination/package.json

if [ -n $PROJECTLICENSE ]; then 
  sed -i '' "s/PROJECTLICENSE/${PROJECTLICENSE}/g" $destination/package.json
fi

# NOTE windows solutions:: realpath
combinedpath=$(realpath "$destination")
ROOTDIR_RELATIVE=$(relative_path_to_ancestor "$combinedpath" "$ROOTDIR")
sed -i '' "s#PLACEHOLDER_ROOTDIR_RELATIVE#${ROOTDIR_RELATIVE}#g" "$destination/.config"
