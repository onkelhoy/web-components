#!/bin/bash

# variables 
PACKAGE_DIR="${ROOTDIR%/}/packages" # removes trailing slash from ROOTDIR

build_json() {
  local dir="$1"
  local is_package=0

  echo "Processing $dir"

  # skip if .config missing or SHOWCASE_SKIP set
  if [[ -f "$dir/.config" ]]; then
    source "$dir/.config"
    if [[ "$SHOWCASE_SKIP" == "1" ]]; then return; fi

    # check package.json
    
    if [[ -f "$dir/package.json" ]]; then
      is_package=1
    fi

    # Print folder info (you can adapt this to JSON output)
    echo "package=$is_package"
  fi

  if [[ "$is_package" -eq 1 ]]; then return; fi

  # recursively process children
  for child in "$dir"/*/; do
    [[ -d "$child" ]] || continue
    build_json "${child%/}"
  done
}

# TODO 
# 1. need this info to pass to the showcase page so we can build the meny 
# 2. local vs global showcase? local could showcase just the different pages under views (just a tabs)

# echo "[" > "$SCRIPT_DIR/menu.json"
build_json "$PACKAGE_DIR"
# echo "]" >> "$SCRIPT_DIR/menu.json"
