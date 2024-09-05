#!/bin/bash

# basic variables 
SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

analyse_type="web-component"
# check flags 
for arg in "$@"; do
  # call script with all arguments 
  if [[ $arg == "--theme" ]]; then
    analyse_type="theme"
  elif [[ $arg == --location=* ]]; then 
    export PACKAGE_LOCATION="${arg#*=}"
  fi 
done

bash $SCRIPTDIR/$analyse_type/run.sh $@
