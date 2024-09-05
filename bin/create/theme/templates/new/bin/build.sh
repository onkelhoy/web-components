#!/bin/bash

BUILD_MODE="prod"
# check for flags 
for arg in "$@"; do
  # check: --prod flag
  if [[ $arg == "--dev" ]]; then
    BUILD_MODE="dev"
  fi
done

# init output file
rm -rf lib
mkdir lib
touch "lib/style.css"

# Initialize arrays
imports=()
light=()
dark=()
others=()

# Find and categorize files 
# note: (done injects into while to keep bash on same tread - else the arrays references are pointing to old )
while IFS= read -r file; do
  filename=$(basename "$file")
  
  case "$filename" in
    *_import.scss) 
      imports+=("$file")
      ;;
    *light.scss) 
      light+=("$file")
      ;;
    *dark.scss) 
      dark+=("$file")
      ;;
    *) 
      others+=("$file")
      ;;
  esac
done < <(find styles -name "*.scss" | grep -v "\.skip\.scss$") # magic step !

# Combine arrays in desired order
ordered_files=("${imports[@]}" "${light[@]}" "${dark[@]}" "${others[@]}")

# Compile each file and append to the final CSS file
for file in "${ordered_files[@]}"; do
  if [ "$BUILD_MODE" == "prod" ]; then 
    CSS=$(sass "$file" --style=compressed --no-source-map)
  else 
    CSS=$(sass "$file" --no-source-map)
  fi

  echo "$CSS" >> "lib/style.css"
done

echo "All CSS files have been combined into lib/style.css"
