#!/bin/bash

# sh .scripts/build.sh

# Initialize the flag as unset
force_mode=false

case "$1" in
  --force|-f) force_mode=true ;;
esac

# get variables
source .env 

# intitialize folder 
mkdir -p views/doc/auto &> /dev/null
mkdir -p views/doc/public/markdown &> /dev/null

# Check if the auto mode flag is set
if [ "$force_mode" = true ]; then
    # initialize auto folder
    rm -rf .generate/doc/auto 
    mkdir .generate/doc/auto

    # copy the current directory
    dir=$(pwd)

    # cd into auto-doc script
    cd $ROOTDIR/scripts/auto-doc/

    # auto document 
    sh auto.sh "styles" $dir
    sh auto.sh "logic" $dir
    sh auto.sh "intro" $dir

    # cd back to package-root
    cd $dir
else
    # Copy the current directory
    dir=$(pwd)

    # CD into auto-doc script
    cd $ROOTDIR/scripts/auto-doc/

    # Auto document if files do not exist
    if [ ! -f "$dir/views/doc/auto/styles.md" ]; then
        sh auto.sh "styles" $dir
    fi

    if [ ! -f "$dir/views/doc/auto/logic.md" ]; then
        sh auto.sh "logic" $dir
    fi

    if [ ! -f "$dir/views/doc/auto/intro.md" ]; then
        sh auto.sh "intro" $dir
    fi

    # CD back to package-root
    cd $dir
fi

# combine the auto-generated documents
cat README.md views/doc/auto/intro.md views/doc/auto/logic.md views/doc/auto/styles.md | tr '\r' '\n' > views/doc/public/markdown/$PREFIXNAME-document.md
