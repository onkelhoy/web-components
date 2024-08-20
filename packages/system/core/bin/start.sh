#!/bin/bash

# variables
package=$(pwd)
view=${1:-web}

for arg in "$@"; do
  if [[ $arg == --view=* ]]; then 
    view="${arg#*=}"
  fi 
done

# cleanup
cleanup() {
  echo "[start] cleanup"
  kill $watch_pid 
  kill $server_pid

  npm run build -- --prod
  exit 0
}
trap cleanup INT

# only run build if lib/bundle.js is not present 
if [[ ! -f lib/bundle.js ]]; then 
  npm run build -- --dev
fi

# runners
npm run watch &
watch_pid=$!

npx @papit/server --verbose --location=$package/views/$view --live $@ &
server_pid=$!

# final 
wait 