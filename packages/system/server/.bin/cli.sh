#!/bin/bash

# NOTE: by deafult calling `npx server`
# will execute this file, as defined in package.json under the "bin" section

if [ ! -f "./build/run.sh" ]; then 
  npm run build -- --dev
fi

if [ ! -f "./build/run.sh" ]; then 
  echo "[error] server build/run.sh file not found"
else 
  sh ./build/run.sh $@
fi