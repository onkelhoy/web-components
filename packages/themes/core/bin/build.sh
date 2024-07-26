#!/bin/bash

# read the variables
source .config 

function compile() {
  foldername=$(dirname "$1")
  filename=$(basename "$1")
  filename_no_ext="${filename%.*}"

  # Set the input and output file paths
  input_file="$1"
  output_css="$foldername/$filename_no_ext.css"
  output_file="$foldername/$filename_no_ext.ts"

  # Compile the SCSS file to CSS
  sass "$input_file":"$output_css" --style=compressed --no-source-map

  # Wait for the CSS file to be created
  while [ ! -f "$output_css" ]; do
    sleep 1
  done
}

# run on all sass files
find . -name "*.scss" | grep -v "\.skip\.scss$" | while read -r file; do compile "$file"; done

LIGHTROOT=1
DARKROOT=1

# Specify the output file
outputFile="style.css"

# Clear or create the output file
> "$outputFile"

# Inject the imports if exsits
if [ -f "styles/imports.css" ]; then 
  cat "styles/imports.css" >> "$outputFile"
  echo "" >> "$outputFile"
fi

# extract the 2 types 
if [[ ! -f "styles/light.css" ]]; then 
  LIGHT_THEME=$(sed -n '/:root {/,/}/p' "styles/light.css" | sed 's/:root {//g' | sed 's/}//g')
fi 
if [[ ! -f "styles/dark.css" ]]; then 
  DARK_THEME=$(sed -n '/:root {/,/}/p' "styles/dark.css" | sed 's/:root {//g' | sed 's/}//g')
fi

# loop through light and dark themes
for mode in "light" "dark"; do
  FILE_PATH="styles/$mode.css"
  if [ -f $FILE_PATH ]; then 

    # Define opposite mode
    if [ "$mode" == "light" ]; then 
      TARGET=$LIGHT_THEME
      OPPOSITE=$DARK_THEME
    else
      TARGET=$DARK_THEME
      OPPOSITE=$LIGHT_THEME
    fi

    # generate new content
    CLASS_CONTENT="\n.theme-$mode {\n$TARGET\n}\n"
      
    MEDIA_QUERY_CONTENT="@media (prefers-color-scheme: $mode) {\n .theme-opposite {\n$OPPOSITE\n }\n \t:root {\n$TARGET\n  }\n}"
    NEW_CONTENT="$MEDIA_QUERY_CONTENT"
    NEW_CONTENT=$(echo "$NEW_CONTENT" | sed 's/%/%%/g')

    if [ $mode == "light" ]; then 
      LIGHTROOT="$CLASS_CONTENT"
    else 
      DARKROOT="$CLASS_CONTENT"
    fi 

    # remove :root block from original file and append new content
    sed '/:root {/,/}/d' $FILE_PATH >> $outputFile
    printf "\n$NEW_CONTENT" >> $outputFile
  fi
done

# insert light and dark before (to keep order!)
if [[ "$LIGHTROOT" != 1 ]]; then
  echo "\n$LIGHTROOT" >> $outputFile
fi
if [[ "$DARKROOT" != 1 ]]; then
  echo "\n$DARKROOT\n" >> $outputFile
fi

# Loop through the CSS files in the directory
for file in "styles"/*.css
do
  # Skip if current file is any of the files
  if [ "$file" = "$outputFile" ] || [ "$file" = "styles/light.css" ] || [ "$file" = "styles/dark.css" ] || [ "$file" = "styles/imports.css" ]; then
    continue
  fi

  # Concatenate each file to the output file
  cat "$file" >> "$outputFile"
  echo "" >> "$outputFile"
done

find styles -type f -path "*.css" -delete

echo "All CSS files have been combined into $outputFile"
