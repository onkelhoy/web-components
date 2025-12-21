#!/bin/bash

# read the variables
source .config 
  
# create rootdir (now based on relative paths)
ROOTDIR=$(npm prefix)

bash $ROOTDIR/bin/version/run.sh $(pwd)

exit 4