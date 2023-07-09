#!/bin/bash

function compile() {
  foldername=$(dirname "$1")
  filename=$(basename "$1")
  filename_no_ext="${filename%.*}"

  # Set the input and output file paths
  input_file="$1"
  output_css="$foldername/$filename_no_ext.css"
  output_file="$foldername/$filename_no_ext.ts"

  # Compile the SCSS file to CSS
  node-sass "$input_file" "$output_css"

  # Wait for the CSS file to be created
  while [ ! -f "$output_css" ]; do
    sleep 1
  done

  # Convert the CSS code to a JavaScript string
  CSS=$(cat "$output_css") # | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

  # Write the JavaScript code to a file
  echo "export const style = \`$CSS\`;" > "$output_file"

  # Remove the intermediate CSS file
  rm "$output_css"
}

# run on all sass files
if [[ -z "$1" ]]; then
  find ./src -name "*.scss" | while read -r file; do compile "$file"; done
else
  compile "$1"
fi
