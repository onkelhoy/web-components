#!/bin/bash

# get variables
source .env 

if [ "$1" != "--child" ]; then
  read -p "Do you wish cleanup?: (y/n) " cleanup_ans
  cleanup_ans=$(echo "$cleanup_ans" | tr '[:upper:]' '[:lower:]')
  if [[ "$cleanup_ans" == "y" || "$cleanup_ans" == "yes" ]]; then
    rm views/variations/index.html
    rm views/variations/main.js
    rm views/variations/style.css
  fi

  # build everything
  npm run build

  # extract the types 
  sh $ROOTDIR/scripts/analyse/run.sh $(pwd)
fi

# build variations
sh $ROOTDIR/scripts/variations/run.sh $(pwd)

if [ "$1" != "--child" ]; then
  sh .scripts/start.sh variations
fi 