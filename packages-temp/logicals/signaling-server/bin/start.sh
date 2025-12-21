#!/bin/bash

# cleanup
cleanup() {
  echo "[start] cleanup"
  kill $server_pid

  npm run build -- --prod
  exit 0
}
trap cleanup INT

npm run build -- --dev

bash ./bin/cli.sh $@ &
server_pid=$!

# final 
wait 