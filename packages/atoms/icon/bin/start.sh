#!/bin/bash

# variables
view=${1:-icon}

for arg in "$@"; do
  if [[ $arg == --target=* ]]; then 
    view="${arg#*=}"
  fi 
done

# cleanup
cleanup() {
  echo "[start] cleanup"
  kill $watch_pid $server_pid

  npm run build -- --prod --bundle
  exit 0
}
trap cleanup INT

npm run build -- --dev

# runners
npm run watch &
watch_pid=$!

npx @papit/server --log-level="debug" --location=$(pwd)/views --live $@ &
server_pid=$!

# final 
wait 