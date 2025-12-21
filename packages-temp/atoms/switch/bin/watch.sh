#!/bin/bash

export PACKAGE_DIR=$(pwd)

cleanup() {
  echo "[watch] Cleaning up in $PACKAGE_DIR..."
  
   # Kill only processes started by this script, not all esbuild/tsc
  [[ -n "$tsc_pid" ]] && kill "$tsc_pid" 2>/dev/null
  [[ -n "$esbuild_pid" ]] && kill "$esbuild_pid" 2>/dev/null
  [[ -n "$watch_css_pid" ]] && kill "$watch_css_pid" 2>/dev/null

  # Ensure no zombie processes survive
  wait "$tsc_pid" 2>/dev/null
  wait "$esbuild_pid" 2>/dev/null
  wait "$watch_css_pid" 2>/dev/null

  exit 0
}

# Catch Ctrl+C, termination, and script exit
trap cleanup INT TERM EXIT SIGINT

# Extract dependencies and devDependencies using Node.js
DEPENDENCIES=$(node -pe "
  const pkg = require('$(pwd)/package.json');
  [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].join(' --external:')
")

# Watch CSS
node ./bin/_utils/watch-sass.cjs &
watch_css_pid=$!

# TypeScript (watch mode)
tsc --emitDeclarationOnly --preserveWatchOutput -w &
tsc_pid=$!

# esbuild (watch mode)
esbuild --format=esm "./src/index.ts" \
  --bundle \
  --watch=forever \
  --allow-overwrite \
  --outfile="./lib/bundle.js" \
  --external:$DEPENDENCIES &
esbuild_pid=$!

# wait for all background processes to complete
wait
