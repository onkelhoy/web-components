#!/bin/bash

# variables 
HOME_PATH=""
NOT_FOUND_PATH=""
ERROR_PATH=""

PAGES=()
PACKAGE_PAGES_DIR="${ROOTDIR%/}/packages" # remove trailing slash from ROOTDIR

read -p "Whats the pages folder (under packages, default is \"pages\"): " PAGES_FOLDER
[[ -z "$PAGES_FOLDER" ]] && PAGES_FOLDER="pages"
PACKAGE_PAGES_DIR="${PACKAGE_PAGES_DIR%/}/${PAGES_FOLDER}" # append pages folder
echo "pages folder: \"$PACKAGE_PAGES_DIR\""

# setup github pages folder 
GITHUB_DIR="${ROOTDIR%/}/.github/docs"

rm -rf "$GITHUB_DIR" &> /dev/null # clear files and sub-folders  
mkdir -p "$GITHUB_DIR/dependencies" # initiate dependency folders
mkdir -p "$GITHUB_DIR/pages" # initiate pages folder 

if [[ ! -d "$PACKAGE_PAGES_DIR" ]]; then
  echo "[error] Cannot find pages folder. You provided: '$PACKAGE_PAGES_DIR'"
  exit 1
fi

echo ""
echo "Select the base-pages (will be default to respective name if found e.g. home)" 
read -p "home-page: " HOME_NAME
read -p "not-found-page: " NOT_FOUND_NAME
read -p "error-page: " ERROR_NAME

[[ -z "$HOME_NAME" ]] && HOME_NAME="home"
[[ -z "$NOT_FOUND_NAME" ]] && NOT_FOUND_NAME="not-found"
[[ -z "$ERROR_NAME" ]] && ERROR_NAME="error"

gather_packages() {
  local dir="$1"
  local name
  name="$(basename "$dir")"

  # Reset NAME before sourcing .config
  NAME=""


  # skip if .config missing or SHOWCASE_SKIP set
  if [[ ! -f "$dir/.config" ]]; then
    return 
  fi 

  # RESET
  IGNORE_PAGE=false
  source "$dir/.config"

  if [[ "$IGNORE_PAGE" == true || "$IGNORE_PAGE" == "1" ]]; then 
    return; 
  fi

  if [[ ! -f "$dir/package.json" ]]; then
    # DIRECTORY FOUND
    # recursively process children
    for child in "$dir"/*/; do
      [[ -d "$child" ]] || continue
      gather_packages "${child%/}"
    done

    return 
  fi 

  # PACKAGE FOUND 
  PAGES+=("$dir")

  local effective_name="${NAME:-$name}"

  # Assign base pages if names match (only if not already set as a path)
  if [[ "$effective_name" == "$HOME_NAME" ]]; then
    HOME_PATH="$dir"
  elif [[ "$effective_name" == "$NOT_FOUND_NAME" ]]; then
    NOT_FOUND_PATH="$dir"
  elif [[ "$effective_name" == "$ERROR_NAME" ]]; then
    ERROR_PATH="$dir"
  fi

  # Fallback: if HOME_PATH wasn't set by name match, use the first valid package
  if [[ -z "$HOME_PATH" ]]; then
    HOME_PATH="$dir"
  fi
}

gather_packages "$PACKAGE_PAGES_DIR"
echo ""

if [[ -z "$HOME_PATH" ]]; then 
  echo "error: no home-page found" 
  exit 1
fi 
if [[ ! -f "$HOME_PATH/.config" ]]; then 
  echo "error: home-page missing .config file" 
  exit 1
fi 

# expose pages array 
export PAGE_PATHS=$(IFS=, ; echo "${PAGES[*]}")

DEPENDENCIES=$(node "$SCRIPTDIR/pages/extract-dependencies.js")
if [[ "$DEPENDENCIES" == ERROR:* ]]; then 
  echo "$DEPENDENCIES"
  exit 1 
fi

IFS=',' read -ra DEP_ARRAY <<< "$DEPENDENCIES"

IMPORTMAP=()
ROUTES=()
THEMES=()

lower_case() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

# NOTE support for other packages outisde the scope of papit might need different approach on how to include all
# papit has only one "bundle.js" file and will be taken 
for dep in "${DEP_ARRAY[@]}"; do

  if [[ -f "$dep/package.json" && -f "$dep/.config" ]]; then 
    cd "$dep"

    source ".config"

    # only build if necessary 
    if [[ ! -d "./lib" || -n "$FORCE" ]]; then 
      npm run build -- --prod &> /dev/null
    fi 

    if [[ ! -f "./lib/bundle.js" ]]; then 
      if [[ -f "./lib/style.css" ]]; then 
        # theme found 
        echo "Theme added: $PACKAGE_NAME"
        cp "./lib/style.css" "$GITHUB_DIR/$PACKAGE_NAME.css"
        THEMES+=("<link rel=\"stylesheet\" href=\"$PACKAGE_NAME.css\" />")
      else 
        echo "$NAME built but no lib/bundle.js file found - skipped" 
      fi 
      continue
    fi 

    TARGET_DIR="$GITHUB_DIR/dependencies/$FULL_NAME"
    mkdir -p "$TARGET_DIR"

    IMPORTMAP+=("\"$FULL_NAME\": \"./dependencies/$FULL_NAME/index.js\"")

    cp "./lib/bundle.js" "$TARGET_DIR/index.js"
    echo "Dependency added: $NAME"
  fi 
done

echo ""
cd "$SCRIPTDIR"
for page in "${PAGES[@]}"; do 

  cd "$page"
  source ".config"
  source "./src/.config"
  # only build if necessary 
  if [[ ! -d "./lib" || -n "$FORCE" ]]; then 
    npm run build -- --prod &> /dev/null
  fi 
  
  mkdir -p "$GITHUB_DIR/dependencies/$FULL_NAME"

  IMPORTMAP+=("\"$FULL_NAME\": \"./dependencies/$FULL_NAME/index.js\"")

  cp "./lib/bundle.js" "$GITHUB_DIR/dependencies/$FULL_NAME/index.js"
  echo "Page added: $NAME"

  COPY_PATH="$GITHUB_DIR/pages/$NAME.html"
  if [[ "$page" == "$HOME_PATH" ]]; then 
    COPY_PATH="$GITHUB_DIR/pages/home.html"
  elif [[ "$page" == "$NOT_FOUND_PATH" ]]; then 
    COPY_PATH="$GITHUB_DIR/pages/404.html"
  elif [[ "$page" == "$ERROR_PATH" ]]; then 
    COPY_PATH="$GITHUB_DIR/pages/500.html"
  fi 

  cp "$SCRIPTDIR/pages/template/page/index.html" "$COPY_PATH"
  sed -i '' "s#PLACEHOLDER_TITLE#${NAME}#g" "$COPY_PATH"
  sed -i '' "s#PLACEHOLDER_SCRIPT#${FULL_NAME}#g" "$COPY_PATH"
  sed -i '' "s#PLACEHOLDER_HTML#${HTML_NAME}#g" "$COPY_PATH"
done
cd "$SCRIPTDIR"
source "$HOME_PATH/.config"

# COPY - Generate final HTML by replacing placeholders
IMPORTMAP_JSON=$(printf "        %s,\n" "${IMPORTMAP[@]}")
IMPORTMAP_JSON="${IMPORTMAP_JSON%,}"  # remove the trailing comma
ROUTES_HTML=$(printf "    %s\n" "${ROUTES[@]}")
THEMES_HTML=$(printf "  %s\n" "${THEMES[@]}")

awk -v title="$NAME" \
    -v homepage="$FULL_NAME" '
BEGIN {
  import_idx = 0;
  theme_idx = 0;
  while ((getline line < "/dev/fd/3") > 0) {
    importmap_lines[++import_idx] = line;
  }
  while ((getline line < "/dev/fd/4") > 0) {
    theme_lines[++theme_idx] = line;
  }
}
{
  if ($0 ~ /PLACEHOLDER_TITLE/) {
    gsub(/PLACEHOLDER_TITLE/, title);
    print;
  } else if ($0 ~ /PLACEHOLDER_IMPORTMAP/) {
    for (i = 1; i <= import_idx; i++) print importmap_lines[i];
  } else if ($0 ~ /PLACEHOLDER_THEMES/) {
    for (i = 1; i <= theme_idx; i++) print theme_lines[i];
  } else {
    print;
  }
}
' "$SCRIPTDIR/pages/template/root/index.html" \
   3<<< "$IMPORTMAP_JSON" 4<<< "$THEMES_HTML" > "$GITHUB_DIR/index.html"

cp "$SCRIPTDIR/pages/template/root/main.js" "$GITHUB_DIR/main.js"
cp "$SCRIPTDIR/pages/template/root/style.css" "$GITHUB_DIR/style.css"

echo ""
echo "final desitnation: \"$GITHUB_DIR\""
echo "" 

read -p "Would you like to move this into the global \"docs\" folder [0/1]: " MOVE_ANS
if [[ "$MOVE_ANS" == "1" ]]; then 
  rm -rf "$ROOTDIR/docs" &> /dev/null
  cp -r "$GITHUB_DIR" "$ROOTDIR/docs"
fi 