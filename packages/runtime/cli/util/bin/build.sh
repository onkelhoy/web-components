#!/bin/bash

SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# get environment variables
source .config

# Remove the build directory
rm -rf .papit/build

# then re-create it 
mkdir -p .papit/build

# Extract dependencies and devDependencies using Node.js
DEPENDENCIES=$(node -pe "
  const pkg = require('$(pwd)/package.json');
  [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].join(' --external:')
")

# esbuild part
esbuild --format=esm "./src/index.ts" --platform=node --bundle --allow-overwrite --outfile="./lib/bundle.js" --external:$DEPENDENCIES