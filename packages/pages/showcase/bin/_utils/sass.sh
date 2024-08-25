#!/bin/bash

function compile() {
  local filepath=$1
  foldername=$(dirname "$filepath")
  filename=$(basename "$filepath")
  filename="${filename%.*}"

  # # Compile SCSS to CSS and capture the output in a variable
  CSS=$(sass "$filepath" --style=compressed --no-source-map)

  # Write the JavaScript code to a file
  echo "export const style = \`$CSS\`;" > "$foldername/$filename.ts"
}

# run on all sass files
if [[ -z "$1" ]]; then
  find ./src -name "*.scss" | grep -v "\.skip\.scss$" | while read -r file; do compile "$file"; done
else
  compile "$1"
fi