#!/bin/bash

export PACKAGE_DIR=$(pwd)

cleanup() {
  echo "[watch] cleanup"
  kill $tsc_pid
  exit
}

trap cleanup INT

tsc -w --preserveWatchOutput &
tsc_pid=$!

# wait for all background processes to complete
wait
