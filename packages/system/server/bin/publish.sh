#!/bin/bash

# ask versioning
echo "server - semantic versioning"
echo "[0] none"
echo "[1] patch"
echo "[2] minor"
echo "[3] major"
echo ""
echo "empty results in 'none'"
read -p "answer: " choice
echo ""

# Increase version 
if [[ $choice == 1 ]]; then 
  npm version patch
elif [[ $choice == 2 ]]; then 
  npm version minor
elif [[ $choice == 3 ]]; then 
  npm version major
fi

# Run build 
npm run build -- --prod

# NPM Publish 
npm publish
