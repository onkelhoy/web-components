#!/bin/bash

# init output file
rm -rf lib
mkdir lib
touch "lib/style.css"
# touch "lib/fallback.css"

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
    *import.scss) 
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

LIGHT=""
DARK=""
# Compile each file and append to the final CSS file
for file in "${ordered_files[@]}"; do
  filename=$(basename "$file")

  CSS=$(sass "$file" --style=compressed --no-source-map)

  if [[ $filename == *light.scss ]]; then
    LIGHT=$(printf "%s" "$CSS" | sed -e 's/:root\s*{//' -e 's/}$//')
  elif [[ $filename == *dark.scss ]]; then
    DARK=$(printf "%s" "$CSS" | sed -e 's/:root\s*{//' -e 's/}$//')
  else 
    echo "$CSS" >> "lib/style.css"
  fi
done

# printf "%s" ":root{$LIGHT}" >> "lib/style.css"

printf "%s" "@media (prefers-color-scheme: dark) {.theme-opposite,*::part(theme-opposite) {$LIGHT}:root {$DARK}}" >> "lib/style.css"
printf "%s" "@media (prefers-color-scheme: light) {.theme-opposite,*::part(theme-opposite) {$DARK}:root {$LIGHT}}" >> "lib/style.css"

# add classes later so it would override 
printf "%s" ".theme-light{$LIGHT}" >> "lib/style.css"
printf "%s" ".theme-dark{$DARK}" >> "lib/style.css"

echo "All CSS files have been combined into lib/style.css"
