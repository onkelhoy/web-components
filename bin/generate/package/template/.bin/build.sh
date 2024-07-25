#!/bin/bash

SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# we allow for global flags (mostly watch)
if [[ -z "$DEV" ]]; then 
  DEV=false
fi 
if [[ -z "$PROD" ]]; then 
  PROD=false
fi 

# check for flags 
for arg in "$@"; do
  # check: --prod flag
  if [[ $arg == "--prod" ]]; then
    PROD=true
  elif [[ $arg == "--dev" ]]; then
    DEV=true
  fi
done

if [[ "$PROD" == false && "$DEV" == false ]]; then 
  echo "Choose wich build option you want" 
  echo "1. develpment"
  echo "2. production"
  echo ""
  read -p "choose: " build_type
  if [ "$build_type" == "1" ]; then 
    DEV=true 
  else 
    PROD=true 
  fi 
fi 

# in a local mode we want to load the environment, (but in CI/CD pipeline we dont)
if [[ -z "$ROOTDIR" ]]; then 
  # get environment variables
  source .config
  
  # create rootdir (now based on relative paths)
  export ROOTDIR=$(realpath $ROOTDIR_RELATIVE)
fi

# Remove the build directory
rm -rf build
rm -rf types

# then re-create it 
mkdir build

# compile the styles 
bash "$SCRIPTDIR/_utils/sass.sh"

# Extract dependencies and devDependencies using Node.js
DEPENDENCIES=$(node -pe "
  const pkg = require('$ROOTDIR/package.json');
  [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})].join(',')
")

if [[ "$DEV" == true ]]; then
  # typescript part : making sure we have types 
  tsc --emitDeclarationOnly
  
  # esbuild part
  esbuild --format=esm "./src/index.ts" --bundle --allow-overwrite --outfile="./build/bundle.js" --external:$DEPENDENCIES
elif [[ "$PROD" == true ]]; then 
  # typescript part : making sure we have types 
  tsc --emitDeclarationOnly -p tsconfig.prod.json

  # esbuild part
  esbuild --format=esm "./src/index.ts" --bundle --minify --allow-overwrite --outfile="./build/bundle.js" --tsconfig=tsconfig.prod.json --external:$DEPENDENCIES
fi

if [[ -f "./react/declerations.d.ts" ]] && [[ -d "./build/react/" ]]; then 
  cp "./react/declerations.d.ts" "./build/react/"
fi 

# Find all files that do not end with .js, .ts, or .config and copy them to the destination directory
rsync -a --exclude='*.js' --exclude="*.ts" --exclude="*.config"  --prune-empty-dirs "./src/" "./build"

echo ""

# clear the console
echo "$CLASS_NAME successfully built"