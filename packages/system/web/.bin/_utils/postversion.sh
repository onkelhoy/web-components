#!/bin/bash

# read the variables
source .config 
  
# create rootdir (now based on relative paths)
ROOTDIR=$(realpath $ROOTDIR_RELATIVE)

sh $ROOTDIR/bin/version/run.sh $(pwd)

exit 4