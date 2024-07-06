#!/bin/bash

# basic variables 
export ROOTDIR=$(pwd)
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# extract project-scope variable 
PROJECTSCOPE=$(node -pe "require('$ROOTDIR/package.json').name")
export PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')

# extract git-name 
GITNAME=$(git config --global user.name)
export GITNAME=${GITNAME:-anonymous} # if empty then anonymous will be default author name

# check flags 
for arg in "$@"
do
  # call script with all arguments 
  if [[ $arg == "--project" ]]; then
    sh "$SCRIPTDIR/project.sh" "$@"
    exit 0
  elif [[ $arg == "--sub-package" ]]; then
    sh "$SCRIPTDIR/sub-package.sh" "$@"
    exit 0
  elif [[ $arg == "--package" ]]; then
    sh "$SCRIPTDIR/package.sh" "$@"
    exit 0
  fi
done

# if we are here means no flag detected 
echo "Choose one of the options"
echo "1. package"
echo "2. sub-package"
echo "3. project"
echo ""
read -p "option: " option_answer

while [ -z "$option_answer" ]; do
  echo "must choose a option"
  read -p "option: " option_answer
done
echo ""

if [[ $option_answer == 1 || $option_answer == "package" ]]; then 
  sh "$SCRIPTDIR/package.sh" "$@"
  exit 0
elif [[ $option_answer == 2 || $option_answer == "sub-package" ]]; then 
  sh "$SCRIPTDIR/sub-package.sh" "$@"
  exit 0
else
  sh "$SCRIPTDIR/project.sh" "$@"
  exit 0
fi 

echo "something went wrong.." 