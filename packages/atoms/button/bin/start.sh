#!/bin/bash

# variables
package=$(pwd)
view=${1:-button}

for arg in "$@"; do
  if [[ $arg == --view=* ]]; then 
    view="${arg#*=}"
  fi 
done

# cleanup
has_cleaned=false
cleanup() {
  if [[ $has_cleaned == true ]]; then 
    return 
  fi 

  has_cleaned=true
  
  echo "[start] cleanup"
  cd $package
  
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

# Try running the server with npm workspace
cd $(npm prefix)

npm run server --include-workspace-root=true --workspace="$(npm prefix)" -- --verbose --location=$package/views/$view --live --nosig "$@" &
server_pid=$!

# final 
wait 