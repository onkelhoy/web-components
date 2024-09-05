#!/bin/bash

export PACKAGE_DIR=$(pwd)

cleanup() {
  echo ""
  echo "[watch] cleanup"
  kill $watch_css_pid 
  exit 0
}

trap cleanup INT

# then we watch css
node ./bin/_utils/watch-sass.cjs &
watch_css_pid=$!

# wait for all background processes to complete
wait
