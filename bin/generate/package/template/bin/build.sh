#!/bin/bash

SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# we allow for global flags (mostly watch)
if [ -z "$DEV" ]; then 
  DEV=false
fi 
if [ -z "$PROD" ]; then 
  PROD=false
fi 
if [ -z "$BUNDLE" ]; then 
  BUNDLE=false
fi 

# check for flags 
for arg in "$@"
do
  # check: --prod flag
  if [[ $arg == "--prod" ]]; then
    PROD=true
  elif [[ $arg == "--dev" ]]; then
    DEV=true
  elif [[ $arg == "--bundle" ]]; then
    BUNDLE=true
  fi
done

if [ "$PROD" == false ] && [ "$DEV" == false ] && [ "$BUNDLE" == false ]; then 
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

  echo ""
  read -p "bundle?: (y/n) " do_bundle
  do_bundle=$(echo "$do_bundle" | tr '[:upper:]' '[:lower:]')
  if [[ "$do_bundle" == "y" || "$do_bundle" == "yes" ]]; then 
    BUNDLE=true
  else 
    echo "no bundle choosen"
  fi 
fi 

# in a local mode we want to load the environment, (but in CI/CD pipeline we dont)
if [ -z "$ROOTDIR" ]; then 
  # get environment variables
  source .env
  
  # create rootdir (now based on relative paths)
  export ROOTDIR=$(realpath $ROOTDIR_RELATIVE)
fi

# Remove the dist directory
rm -rf dist

# then re-create it 
mkdir dist

# compile the styles 
bash "$SCRIPTDIR/_utils/sass.sh"

if [ "$DEV" == true ]; then
# DEVELOPMENT BUILD
  if [ "$BUNDLE" == true ]; then
    # Extract dependencies and devDependencies using Node.js
    DEPENDENCIES=$(node -pe "
      const pkg = require('$ROOTDIR/package.json');
      [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})].join(',')
    ")
    esbuild "./src/index.ts" --bundle --allow-overwrite --outfile="./dist/bundle.js" --external:$DEPENDENCIES
  else
    tsc 
  fi
elif [ "$PROD" == true ]; then 
# PRODUCTION BUILD
  if [ "$BUNDLE" == true ]; then 
    # Extract dependencies and devDependencies using Node.js
    DEPENDENCIES=$(node -pe "
      const pkg = require('$ROOTDIR/package.json');
      [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})].join(',')
    ")
    esbuild "./src/index.ts" --bundle --minify --allow-overwrite --outfile="./dist/bundle.js" --tsconfig=tsconfig.prod.json --external:$DEPENDENCIES
  else 
    # NOTE this was the old build method but im not sure if its needed anymore
    tsc -p tsconfig.prod.json

    # Find all .js files in the dist directory and its subdirectories
    find ./dist -name 'style.d.ts' -type f | while read file; do
      # Use esbuild to minify each .js file and overwrite the original file
      rm "$file"
    done

    # Find all .js files in the dist directory and its subdirectories
    find ./dist -name '*.js' -type f | while read file; do
      # Use esbuild to minify each .js file and overwrite the original file
      esbuild "$file" --minify --allow-overwrite --outfile="$file" &> /dev/null
    done
  fi 
fi

if [ -f "./react/declerations.d.ts" ] && [ -d "./dist/react/" ]; then 
  cp "./react/declerations.d.ts" "./dist/react/"
fi 

echo ""

# clear the console
echo "$CLASS_NAME successfully built"