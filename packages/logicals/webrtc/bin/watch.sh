#!/bin/bash

export PACKAGE_DIR=$(pwd)

cleanup() {
  echo "[watch] cleanup"
  kill -9 $tsc_pid 
  kill -9 $esbuild_pid
  kill -9 $watch_css_pid 
  exit 0
}

trap cleanup INT

# Extract dependencies and devDependencies using Node.js
DEPENDENCIES=$(node -pe "
  const pkg = require('$(pwd)/package.json');
  [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].join(' --external:')
")

# then we watch css
node ./bin/_utils/watch-sass.cjs &
watch_css_pid=$!

# typescript part : making sure we have types 
tsc --emitDeclarationOnly --preserveWatchOutput -w &
tsc_pid=$!

# esbuild part
esbuild --format=esm "./src/index.ts" --bundle --watch=forever --allow-overwrite --outfile="./lib/bundle.js" --external:$DEPENDENCIES &
esbuild_pid=$!

# wait for all background processes to complete
wait
