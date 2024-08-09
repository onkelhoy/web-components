#!/bin/bash

export ROOTDIR=$(pwd)
LIST=$(node "$ROOTDIR/bin/_utils/bash-dependency-order.js")

FORCE=false 

if [[ -n "$CI" ]]; then 
  echo "LIST=$LIST" >> $GITHUB_ENV
else 
    # check flags 
  for arg in "$@"; do
    # call script with all arguments 
    if [[ $arg == "--force" ]]; then
      FORCE=true
    fi
  done
fi

echo "flags:" 
echo "- FORCE: $FORCE"

for package in $LIST; do
  cd $package

  FULL_NAME="$package" # fallback
  if [[ -f .config ]]; then 
    source .config 

    if [[ $FORCE == "false" ]]; then 
      read -r name LOCAL_VERSION <<< $(node -pe "let pkg=require('./package.json'); pkg.name + ' ' + pkg.version")
      PROJECTSCOPE=@$(echo "$name" | cut -d'/' -f1 | awk -F'@' '{print $2}')

      if [[ -f "$ROOTDIR/node_modules/$PROJECTSCOPE/$PACKAGE_NAME/package.json" ]]; then 
        CACHE_VERSION=$(node -pe "require('$ROOTDIR/node_modules/$PROJECTSCOPE/$PACKAGE_NAME/package.json').version")

        if [[ $LOCAL_VERSION == $CACHE_VERSION ]]; then 
          echo "$FULL_NAME - skipped"
          continue
        fi 
      fi 
    fi
  fi
  echo "$FULL_NAME"
  if [[ -n "$CI" ]]; then 
    printf " installing ... "
  fi

  # make sure to install dependencies
  if [[ -n "$CI" ]]; then 
    npm ci > /dev/null 
  else 
    npm install > /dev/null
  fi 

  if [[ -n "$CI" ]]; then 
    printf "finished\n"
  fi

  if [[ -n "$CI" ]]; then 
    printf " building ... "
  fi

  npm run build -- --prod > /dev/null # redirects stdout to null while stderr still logs 
  if [[ -n "$CI" ]]; then 
    printf "finished\n"
  else 
    echo " -> finished"
  fi
done 