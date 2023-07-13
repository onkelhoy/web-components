#!/bin/bash

# Remove the dist directory
rm -rf dist

# then re-create it 
mkdir dist

# compile css
sh .scripts/helper/build-sass.sh

# create bundles 
esbuild src/register.ts --bundle --minify --outfile=dist/register.bundle.mjs --format=esm --platform=browser &> /dev/null

# create esm 
esbuild src/register.ts --outfile=dist/register.mjs --format=esm --platform=browser &> /dev/null
esbuild src/component.ts --outfile=dist/component.js --format=esm --platform=browser &> /dev/null
esbuild src/index.ts --outfile=dist/index.js --format=esm --platform=browser &> /dev/null
esbuild src/types.ts --outfile=dist/types.js --format=esm --platform=browser &> /dev/null
esbuild src/style.ts --outfile=dist/style.js --format=esm --platform=browser &> /dev/null

# finally we also use typescript to build the complete package
tsc

# clear the console
echo "files successfully built"