#!/bin/bash

# variables
package=$(pwd)
view=${1:-matrix}

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

# we want to run build to make sure we serve the latest (both JS and CSS) 
npm run build -- --dev

# runners
npm run watch &
watch_pid=$!

# Try running the server with npm workspace
cd $(npm prefix)

npm run server --include-workspace-root=true --workspace="$(npm prefix)" -- --rootdir="$(npm prefix)" --verbose --location=$package/views/$view --live --nosig "$@" &
server_pid=$!

# final 
wait 