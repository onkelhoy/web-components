#!/bin/bash

## TODO FIX 
# build the test file to include all dependencies
# esbuild test/base.test.js --bundle --outfile=dist/test/base.test.js --format=esm --platform=browser

# # source the env file to get name info
# source .env 

# # edit the file to include loader for the custom-elements
# content = cat dist/test/base.test.js
# # echo 

# # Function to stop the server, remove the symlink, and exit
# cleanup() {
#     echo ""
#     echo "Stopping the server and removing the symlink..."
#     kill $SERVER_PID
#     rm node_modules
#     exit
# }

# # Capture Ctrl-C (SIGINT) and call the cleanup function
# trap cleanup SIGINT

# # 1. run the build
# # sh .scripts/helper/build-esbuild.sh

# # # 2. Create symlink
# # ln -s ../../../node_modules node_modules

# # 3. Start HTTP server in the background
# python3 -m http.server &

# # 4. Get the process ID of the HTTP server
# SERVER_PID=$!

# # 5. Open browser to /test
# open "http://localhost:8000/test"

# # 6. Wait for the user to press Ctrl-C
# echo "Press Ctrl-C to stop the server and remove the symlink..."
# wait $SERVER_PID
