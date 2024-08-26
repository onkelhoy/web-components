#!/bin/bash

# basic variables 
export ROOTDIR=$(pwd)
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$ROOTDIR/.config"
loadcolors

# extract project-scope variable 
read -r PROJECTSCOPE GITHUB_REPO <<< $(node -pe "
  const pkg = require('$ROOTDIR/package.json'); 
  const repo = pkg.repository?.url || 'unknown';
  \`\${pkg.name} \${repo}\`
")

if [[ $GITHUB_REPO != "unknown" ]]; then 
  export GITHUB_REPO=${GITHUB_REPO%.git}
else 
  echo "Your project has no Github Repo pointed out in 'package.json' [repository.url]"
  exit 0
fi 

export PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')

# extract git-name 
GITNAME=$(git config --global user.name)
export GITNAME=${GITNAME:-anonymous} # if empty then anonymous will be default author name

# check flags 
for arg in "$@"; do
  # call script with all arguments 
  if [[ $arg == "--project" ]]; then
    bash "$SCRIPTDIR/project/run.sh" "$@"
    exit 0
  elif [[ $arg == "--component" ]]; then
    bash "$SCRIPTDIR/component/run.sh" "$@"
    exit 0
  elif [[ $arg == "--theme" ]]; then
    bash "$SCRIPTDIR/theme/run.sh" "$@"
    exit 0
  elif [[ $arg == "--package" ]]; then
    bash "$SCRIPTDIR/package/run.sh" "$@"
    exit 0
  fi
done

# if we are here means no flag detected 
echo "Choose one of the options"
echo "1. package"
echo "2. theme"
echo "3. project"
echo ""
read -p "option: " option_answer

while [ -z "$option_answer" ]; do
  logwarn "must choose a option"
  read -p "option: " option_answer
done
echo ""

if [[ $option_answer == 1 || $option_answer == "package" ]]; then 
  bash "$SCRIPTDIR/package/run.sh" "$@"
  exit 0
elif [[ $option_answer == 2 || $option_answer == "theme" ]]; then 
  bash "$SCRIPTDIR/theme/run.sh" "$@"
  exit 0
else 
  bash "$SCRIPTDIR/project/run.sh" "$@"
  exit 0
fi 

logerror "something went wrong.." 