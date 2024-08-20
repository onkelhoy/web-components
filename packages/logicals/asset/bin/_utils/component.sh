#!/bin/bash

source .config 
PACKAGE_LOCATION=$(pwd)

# create rootdir (now based on relative paths)
ROOTDIR=$(realpath $ROOTDIR_RELATIVE)

cd $ROOTDIR

npm run create -- --component --location=$PACKAGE_LOCATION