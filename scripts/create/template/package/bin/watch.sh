#!/bin/bash

export PACKAGE_DIR=$(pwd)

cleanup() {
  echo "[watch] cleanup"
  kill $watch_css_pid $tsc_pid
  exit
}

trap cleanup INT

# then we watch css
node ./bin/_utils/watch-sass.js &
watch_css_pid=$!

tsc -w --preserveWatchOutput &
tsc_pid=$!

# wait for all background processes to complete
wait
