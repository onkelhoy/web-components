#!/bin/bash

SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# we allow for global flags (mostly watch)
if [[ -z "$DEV" ]]; then 
  DEV=false
fi 
if [[ -z "$PROD" ]]; then 
  PROD=false
fi 
if [[ -z "$BUNDLE" ]]; then 
  BUNDLE=false
fi 

# check for flags 
for arg in "$@"; do
  # check: --prod flag
  if [[ $arg == "--prod" ]]; then
    PROD=true
  elif [[ $arg == "--dev" ]]; then
    DEV=true
  elif [[ $arg == "--bundle" ]]; then
    BUNDLE=true
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

  echo ""
  read -p "bundle [1/0]: " do_bundle
  do_bundle=$(echo "$do_bundle" | tr '[:upper:]' '[:lower:]')
  if [[ "$do_bundle" == "0" ]]; then 
    BUNDLE=false
  else
    BUNDLE=true 
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

# then re-create it 
mkdir build

if [[ "$DEV" == true ]]; then
# DEVELOPMENT BUILD
  if [[ "$BUNDLE" == true ]]; then
    # Extract dependencies and devDependencies using Node.js
    EXTERNALS=$(node -pe "
      const pkg = require('$ROOTDIR/package.json');
      ['esbuild', ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})]
      .map(dep => '--external:' + dep).join(' ')
    ")
    esbuild "./src/index.ts" --bundle --allow-overwrite --platform=node --outfile="./build/bundle.js" $EXTERNALS
  else
    tsc 
  fi
elif [[ "$PROD" == true ]]; then 
# PRODUCTION BUILD
  if [[ "$BUNDLE" == true ]]; then 
    # Extract dependencies and devDependencies using Node.js
    EXTERNALS=$(node -pe "
      const pkg = require('$ROOTDIR/package.json');
      ['esbuild', ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})]
      .map(dep => '--external:' + dep).join(' ')
    ")

    esbuild "./src/index.ts" --bundle --minify --allow-overwrite --platform=node --outfile="./build/bundle.js" --tsconfig=tsconfig.prod.json $EXTERNALS
  else 
    # NOTE this was the old build method but im not sure if its needed anymore
    tsc -p tsconfig.prod.json

    # Find all .js files in the build directory and its subdirectories
    find ./build -name 'style.d.ts' -type f | while read file; do
      # Use esbuild to minify each .js file and overwrite the original file
      rm "$file"
    done

    # Find all .js files in the build directory and its subdirectories
    find ./build -name '*.js' -type f | while read file; do
      # Use esbuild to minify each .js file and overwrite the original file
      esbuild "$file" --minify --allow-overwrite --platform=node --outfile="$file" --external:"esbuild" &> /dev/null
    done
  fi 
fi

if [[ -f "./react/declerations.d.ts" ]] && [[ -d "./build/react/" ]]; then 
  cp "./react/declerations.d.ts" "./build/react/"
fi 

# Find all files that do not end with .js, .ts, or .config and copy them to the destination directory
rsync -a --exclude='*.js' --exclude="*.ts" --exclude="*.config" --prune-empty-dirs "./src/" "./build"

# echo ""

# clear the console
echo "$CLASS_NAME successfully built"