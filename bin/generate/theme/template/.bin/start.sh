#!/bin/bash

# variables
package=$(pwd)
view=${1:-PLACEHOLDER_NAME}

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

npx @papit/server --verbose --package=$package --view=$view --live $@ &
server_pid=$!

# final 
wait 