#!/bin/bash

# basic variables 
export ROOTDIR=$(pwd)
export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# check flags 
for arg in "$@"; do
  # call script with all arguments 
  if [[ $arg == "--packages" ]]; then
    bash "$SCRIPTDIR/packages.sh" "$@"
    exit 0
  elif [[ $arg == "--showcase" ]]; then
    bash "$SCRIPTDIR/showcase/run.sh" "$@"
    exit 0
  elif [[ $arg == "--pages" ]]; then
    bash "$SCRIPTDIR/pages/run.sh" "$@"
    exit 0
  fi
done

# if we are here means no flag detected 
echo "Choose one of the options"
echo "1. packages"
echo "2. showcase"
echo "3. pages"
echo ""
read -p "option: " option_answer

while [ -z "$option_answer" ]; do
  echo "must choose a option"
  read -p "option: " option_answer
done
echo ""

if [[ $option_answer == 2 || $option_answer == "showcase" ]]; then 
  bash "$SCRIPTDIR/showcase/run.sh" "$@"
  exit 0
elif [[ $option_answer == 3 || $option_answer == "pages" ]]; then 
  bash "$SCRIPTDIR/pages/run.sh" "$@"
  exit 0
else 
  bash "$SCRIPTDIR/packages.sh" "$@"
  exit 0
fi 