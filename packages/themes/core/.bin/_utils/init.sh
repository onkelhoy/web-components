#!/bin/bash

# make scripts executable

# /bin/
chmod +x ./.bin/build.sh
chmod +x ./.bin/publish.sh
chmod +x ./.bin/start.sh

# /bin/_utils/
chmod +x ./.bin/_utils/preversion.sh
chmod +x ./.bin/_utils/postversion.sh

# NOTE: this might be risky (but lazy)
# find ./bin -name "*.sh" | while read -r file; do chmod +x "$file"; done