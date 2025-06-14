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
  echo "Choose which build option you want" 
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

# get environment variables
source .config

# Remove the build directory
rm -rf lib

# then re-create it 
mkdir lib

# compile the styles 
npm run build:sass

# Extract dependencies and devDependencies using Node.js
DEPENDENCIES=$(node -pe "
  const pkg = require('$(pwd)/package.json');
  [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].join(' --external:')
")

if [[ "$DEV" == true ]]; then
  # typescript part : making sure we have types 
  tsc --emitDeclarationOnly
  
  # esbuild part
  esbuild --format=esm "./src/index.ts" --bundle --allow-overwrite --outfile="./lib/bundle.js" --external:$DEPENDENCIES
elif [[ "$PROD" == true ]]; then 
  # typescript part : making sure we have types 
  tsc --emitDeclarationOnly -p tsconfig.prod.json

  # esbuild part
  esbuild --format=esm "./src/index.ts" --bundle --minify --allow-overwrite --outfile="./lib/bundle.js" --tsconfig=tsconfig.prod.json --external:$DEPENDENCIES
fi

if [[ -f "./react/declerations.d.ts" ]] && [[ -d "./lib/react/" ]]; then 
  cp "./react/declerations.d.ts" "./lib/react/"
fi 

# Find all files that matches the criteria and copy them to the destination directory
rsync -a --exclude='*.scss' --exclude='*.js' --exclude="*.ts" --exclude="*.config"  --prune-empty-dirs "./src/" "./lib"

# cleanup types from "src"
mv ./lib/types/src/* ./lib/types
rm -rf ./lib/types/src/

echo ""
echo "$CLASS_NAME successfully built"