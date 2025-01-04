#!/bin/bash

export ROOTDIR=$(pwd)

if [ -z "$PROJECTSCOPE" ]; then 
  PROJECTSCOPE=$(node -e "
    const pkg = require('$ROOTDIR/package.json'); 
    console.log(pkg.name);
  ")
  export PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')
fi

if [[ -n "$CI" ]]; then 
  NOCLEAN=true
  CHECKVERSION=true
  FORCE=true 
else 
  # check flags 
  for arg in "$@"; do
    # call script with all arguments 
    if [[ $arg == "--force" ]]; then
      FORCE=true
    elif [[ $arg == "--no-clean" ]]; then
      NOCLEAN=true
    elif [[ $arg == "--check-version" ]]; then
      CHECKVERSION=true
    fi
  done

  if [ -z "$FORCE" ]; then 
    read -p "run in force mode? (default 0) [1/0]: " force_mode
    if [ "$force_mode" == 1 ]; then 
      FORCE=true
    else 
      FORCE=false
    fi 
  fi 

  if [ -z "$NOCLEAN" ]; then 
    read -p "run without cleanup? (default 0) [1/0]: " clean_mode
    if [ "$clean_mode" == 1 ]; then 
      NOCLEAN=true
    else 
      NOCLEAN=false
    fi 
  fi 

  if [ -z "$CHECKVERSION" ]; then 
    read -p "version check? (default 0) [1/0]: " version_mode
    if [ "$version_mode" == 1 ]; then 
      CHECKVERSION=true
    else 
      CHECKVERSION=false
    fi 
  fi 
fi

echo "flags:" 
echo "- FORCE: $FORCE"
echo "- NOCLEAN: $NOCLEAN"
echo "- CHECKVERSION: $CHECKVERSION"
echo ""

# compute the list
if [ "$CHECKVERSION" == "false" ]; then 
  bash "$ROOTDIR/bin/dependency-order/run.sh"
else 
  bash "$ROOTDIR/bin/dependency-order/run.sh" --check-version
fi 
LIST=$(cat "$ROOTDIR/bin/dependency-order/list")

# Iterate over the list line by line
echo "$LIST" | while IFS=' ' read -r name package version changed; do
  # Access each part: $package, $version, and $changed
  cd $package

  FULL_NAME="$package" # fallback
  if [[ -f .config ]]; then 
    source .config 

    if [[ $FORCE == "false" ]] && [[ -d lib ]]; then 
      if [[ $changed -eq 0 ]]; then 
        echo "$FULL_NAME - skipped"
        continue
      elif [[ -f "$ROOTDIR/node_modules/$PROJECTSCOPE/$PACKAGE_NAME/package.json" ]]; then 
        CACHE_VERSION=$(node -pe "require('$ROOTDIR/node_modules/$PROJECTSCOPE/$PACKAGE_NAME/package.json').version")

        if [[ $version == $CACHE_VERSION ]]; then 
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

  npm run build -- --prod &> /dev/null # redirects stdout to null while stderr still logs 

  if [[ -n "$CI" ]]; then 
    printf "finished\n"
  else 
    echo " -> finished"
  fi
done 

rm "$ROOTDIR/bin/version/.config" &> /dev/null
rm "$ROOTDIR/bin/version/.json" &> /dev/null
rm "$ROOTDIR/bin/dependency-order/list" &> /dev/null