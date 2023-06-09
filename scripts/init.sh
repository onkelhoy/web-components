#!/bin/bash

# install fswatch
read -p "installing fswatch using brew, proceed?: (y/n) " brew_ans
brew_ans=$(echo "$brew_ans" | tr '[:upper:]' '[:lower:]')
if [[ "$brew_ans" != "y" && "$brew_ans" != "yes" ]]; then
  echo "You chose \"no\", so we skip installing fswatch - note that many things are requiring fswatch!"
else 
  brew install fswatch 
fi
echo ""
read -p "installing fq (JSON parser) using brew, proceed?: (y/n) " brew_ans
brew_ans=$(echo "$brew_ans" | tr '[:upper:]' '[:lower:]')
if [[ "$brew_ans" != "y" && "$brew_ans" != "yes" ]]; then
  echo "You chose \"no\", so we skip installing fq - note that many things are requiring fq!"
else 
  brew install fq 
fi
echo ""
echo ""

echo "### install node dependancies"
npm install
echo ""

echo "### init the python chatgtp documentation"
cd ./scripts/auto-doc/documentation/
sh init.sh
echo ""

cd ../../../

echo "project initialized"