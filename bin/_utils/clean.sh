#!/bin/bash

read -p "Delete builds?: [1/0] " builds
if [[ "$builds" != "0" ]]; then
  find packages -type d -path "*/build" -exec rm -rf {} +
  find packages -type d -path "*/lib" -exec rm -rf {} +
fi

read -p "Delete generated views?: [1/0] " gen
if [[ "$gen" != "0" ]]; then
  find packages -type d -path "*/views/generated" -exec rm -rf {} +
fi

read -p "Delete test reports & results?: [1/0] " rr
if [[ "$rr" != "0" ]]; then
  find packages -type d -path "*/tests/test-reports" -exec rm -rf {} +
  find packages -type d -path "*/tests/test-results" -exec rm -rf {} +
fi

# read -p "Delete showcase?: [1/0] " showcase
# if [[ "$showcase" != "0" ]]; then
#   rm -rf showcase
# fi

read -p "Delete analysis?: [1/0] " analysis
if [[ "$analysis" != "0" ]]; then
  find packages -type f -path "*/custom-elements.json" -delete
fi