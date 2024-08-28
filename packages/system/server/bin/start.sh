#!/bin/bash

# variables
package=$(pwd)
view=${1:-server}

for arg in "$@"; do
  if [[ $arg == --view=* ]]; then 
    view="${arg#*=}"
  fi 
done

# cleanup
cleanup() {
  echo "[start] cleanup"
  kill $server_pid

  npm run build -- --prod
  exit 0
}
trap cleanup INT

npm run build -- --dev

bash ./bin/cli.sh --log-level="debug" --open --location="$package/views" --live $@ &
server_pid=$!

# final 
wait 