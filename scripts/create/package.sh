#!/bin/bash

# helper function 
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

# variables
PROJECTLICENSE=$(node -pe "require('$ROOTDIR/package.json').license")

# Array to hold subfolder names
declare -a SUBFOLDERS

# Counter for displaying options
COUNTER=1

echo "Available subfolders:"

# Iterate over each subfolder in the parent directory
for SUBFOLDER in "$ROOTDIR/packages"/*/; do
  # Check if it's a directory
  if [[ -d "$SUBFOLDER" ]]; then
    # Remove trailing slash and get folder name
    FOLDER_NAME=$(basename "$SUBFOLDER")
    # Add to array
    SUBFOLDERS+=("$FOLDER_NAME")
    # Print option for user
    echo "$COUNTER. $FOLDER_NAME"
    COUNTER=$((COUNTER + 1))
  fi
done
echo ""

# Prompt user for choice
read -p "Choose a layer by number or enter a new name: " USER_CHOICE

echo ""
if [[ $USER_CHOICE -ge 1 && $USER_CHOICE -le ${#SUBFOLDERS[@]} ]]; then
  # Valid choice from the list
  FOLDER_NAME="${SUBFOLDERS[$((USER_CHOICE-1))]}"

  echo "You chose: $FOLDER_NAME"
else
  # New name provided & fix empty spaces
  FOLDER_NAME=$(echo "$USER_CHOICE" | tr ' ' '-')

  echo "folder-name & targer-name: $FOLDER_NAME"
  read -p "override target-name: " TARGET_NAME

  # fix empty spaces
  TARGET_NAME=$(echo "$TARGET_NAME" | tr ' ' '-')

  read -p "Include in prefix (y/n): " INCLUDE_IN_PREFIX
  INCLUDE_IN_PREFIX=$(echo "$INCLUDE_IN_PREFIX" | tr '[:upper:]' '[:lower:]')
  
  if [[ "$INCLUDE_IN_PREFIX" == "y" || "$INCLUDE_IN_PREFIX" == "yes" ]]; then
    INCLUDE_IN_PREFIX=true
  else 
    INCLUDE_IN_PREFIX=false
  fi

  TARGET_FOLDER="$ROOTDIR/packages/$FOLDER_NAME"

  echo "\nfolder-name: $FOLDER_NAME"
  echo "target-name: $TARGET_NAME"
  echo "include-in-prefix: $INCLUDE_IN_PREFIX\n"
  echo ""

  echo "Confirm creating of new layer"
  read -p "at: [$TARGET_FOLDER] (y/n): " confirm_folder
  
  confirm_folder=$(echo "$confirm_folder" | tr '[:upper:]' '[:lower:]')
  if [[ "$confirm_folder" == "n" || "$confirm_folder" == "no" ]]; then
    echo "you choose to abort ❎" 
    exit 1
  fi 

  # init folder and config file 
  mkdir $TARGET_FOLDER
  touch $TARGET_FOLDER/config.env

  echo "FOLDER_NAME=$FOLDER_NAME" >> $TARGET_FOLDER/config.env
  echo "TARGET_NAME=$TARGET_NAME" >> $TARGET_FOLDER/config.env
  echo "INCLUDE_IN_PREFIX=$INCLUDE_IN_PREFIX" >> $TARGET_FOLDER/config.env

  echo "\nLayer successfully created" 
fi

TARGET_FOLDER="$ROOTDIR/packages/$FOLDER_NAME"
if [[ -f "$TARGET_FOLDER/config.env" ]]; then
  source "$TARGET_FOLDER/config.env"
  echo "Loaded config from $TARGET_FOLDER/config.env"
  # Add your logic here using the variables from config.env
else
  echo "[ERROR] config.env not found in $TARGET_FOLDER ❎"
  exit 1
fi

# successfully choosen folder
echo ""
echo "proceeding to next step" 

function read_packagename() {
  read -p "Enter package-name: " NAME

  while [ -z "$NAME" ]; do
    echo "[ERROR] must choose a package name ❎"
    read -p "Enter package-name: " NAME
  done

  # fix empty spaces
  NAME=$(echo "$NAME" | tr ' ' '-')
  PACKAGE_NAME="$NAME"

  if [[ $INCLUDE_IN_PREFIX == true ]]; then 
    PACKAGE_NAME="$TARGET_NAME-$NAME"
  fi 

  HTML_NAME="$PROJECTSCOPE-$PACKAGE_NAME"
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

  if [[ "$check" == "1" ]]; then
    break
  else
    echo "[error] package '$FULL_NAME' already exists. Please choose another name."
    echo ""
  fi
done

echo "Package name '$FULL_NAME' is available."

echo ""
echo "name: $NAME"
echo "package-name: $PACKAGE_NAME"
echo "prefix-name: $HTML_NAME"
echo "full-name: $FULL_NAME"
echo ""

read -p "Confirm creation of new package (y/n): " confirm_package
confirm_package=$(echo "$confirm_package" | tr '[:upper:]' '[:lower:]')
if [[ "$confirm_package" == "n" || "$confirm_package" == "no" ]]; then
  echo "you choose to abort ❎" 
  exit 1
fi 

destination="$TARGET_FOLDER/$PACKAGE_NAME"

mkdir "$destination"
rsync -a --exclude='*DS_Store' "$SCRIPTDIR/template/package/" "$destination"

CLASS_NAME=$(echo $PACKAGE_NAME | awk -F"[_-]" '{$1=toupper(substr($1,1,1))substr($1,2); for (i=2;i<=NF;i++){$i=toupper(substr($i,1,1))substr($i,2)}; print}' OFS="")

# Replace occurrences in all files
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/TEMPLATE_LAYER_TYPE/${TARGET_NAME}/g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/TEMPLATE_NAME/${NAME}/g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/TEMPLATE_PACKAGE_NAME/${PACKAGE_NAME}/g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/TEMPLATE_CLASS_NAME/${CLASS_NAME}/g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s/TEMPLATE_HTML_NAME/${HTML_NAME}/g" {} \;
find "$destination" -type f -not -name ".DS_Store" -not -name "*.svg" -not -name "*.ico" -exec sed -i '' "s#TEMPLATE_FULL_NAME#${FULL_NAME}#g" {} \;

sed -i '' "s/GITNAME/${GITNAME}/g" $destination/package.json

if [ -n $PROJECTLICENSE ]; then 
  sed -i '' "s/PROJECTLICENSE/${PROJECTLICENSE}/g" $destination/package.json
fi

# NOTE windows solutions:: realpath
combinedpath=$(realpath "$destination")
ROOTDIR_RELATIVE=$(relative_path_to_ancestor "$combinedpath" "$ROOTDIR")
sed -i '' "s#TEMPLATE_ROOTDIR_RELATIVE#${ROOTDIR_RELATIVE}#g" "$destination/.env"

# initialize package 
# - this makes scripts executable so we can run them without having to pass "--" to pass flags 
cd "$destination" # in 
npm run init 
cd "$ROOTDIR"     # and out 


read -p "[npm install] do you wish to install the package? (y/n): " confirm_install
confirm_install=$(echo "$confirm_install" | tr '[:upper:]' '[:lower:]')
if [[ "$confirm_install" == "n" || "$confirm_install" == "no" ]]; then
  echo "you choose not to install" 
else 
  # installing the component 
  npm install
fi 

echo ""
read -p "[git] do you wish to init with git?: (y/n) " git_ans
git_ans=$(echo "$git_ans" | tr '[:upper:]' '[:lower:]')
if [[ "$git_ans" == "n" || "$git_ans" == "no" ]]; then
  echo "you choose not to commit"
else 
  git add $destination
  git commit -m "add: new $TARGET_NAME component : $NAME"
fi

echo ""
echo "$PACKAGE_NAME successfully created ✅"