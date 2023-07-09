#!/bin/bash

# build first
npm run build

# read the variables
source .env 

# extract the types 
sh $ROOTDIR/scripts/analyse/run.sh $(pwd)

# run the necessary scripts 
sh .scripts/helper/build-doc.sh
sh .scripts/helper/build-variations.sh --child
sh .scripts/helper/build-interactive.sh --child

# run the combine script
sh $ROOTDIR/scripts/combine/run.sh $1