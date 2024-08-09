#!/bin/bash

# variables
package=$(pwd)
view=${1:-core}

for arg in "$@"; do
  if [[ $arg == --view=* ]]; then 
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

npx @papit/server --verbose --open --location=$package/views/$view --live $@ &
server_pid=$!

# final 
wait 