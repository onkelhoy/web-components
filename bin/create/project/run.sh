#!/bin/bash

# Script to create a new project by copying an existing template

echo "project generate run"


# get destination folder 
destination=${1:-$(pwd)/projects}
read -p "Project name: " name

echo "destination: [$destination]"
echo ""
read -p "Change destination: " new_destination
echo ""
if [[ -n $new_destination && $new_destination != "" ]]; then 
  destination=$new_destination
  echo "new destination: [$destination]"
else 
  echo "destination remains the same: [$destination]"
fi 
while [ -d "$destination" ]; do 
  echo "destination folder already exists, override or choose another path" 
  
  echo ""
  read -p "do you wish to override? [1/0]: " confirm_override
  if [ "$confirm_override" == "1" ]; then
    rm -rf $destination
  else 
    read -p "other destination: " destination
  fi 
done

echo ""
read -p "create project at ($destination) [1/0]: " confirm_create
if [ "$confirm_create" == "0" ]; then
  echo "you choose not to install" 
  exit 0
fi 

# Create the destination directory if it doesn't exist
mkdir -p "$destination"

# Exclusions list
exclusions=(
  ".git"
  "node_modules"
  "packages"
  "$ROOTDIR/package.json"
  "$ROOTDIR/.config"
  "package-lock.json"
  "README.md"
  "LICENSE"
)

# Build rsync command with exclusions
rsync_cmd="rsync -av"
for exclusion in "${exclusions[@]}"; do
    rsync_cmd+=" --exclude='$exclusion'"
done
rsync_cmd+=" $ROOTDIR/ $destination"

# Execute rsync command
eval "$rsync_cmd"

# now copy the template stuff as well 
rsync -av $SCRIPTDIR/project/template/ $destination

fullname="@$name/root"

# replace names 
sed -i '' "s#PROJECTSCOPE#$fullname#g" $destination/README.md
sed -i '' "s#PROJECTSCOPE#$fullname#g" $destination/package.json
sed -i '' "s#PLACEHOLDER_NAME#$name#g" $destination/package.json
sed -i '' "s#PLACEHOLDER_PREFIX#$name#g" $destination/.config

# Setup Git & Project install 
cd $destination
git init 
npm run init 
git add .
git commit -m "init: project $fullname initialized"

# Completion message
echo "Project $fullname created successfully at $destination"