#!/bin/bash

# initiate variables 
export ROOTDIR=$(pwd)

if [[ -z "$LIST" ]]; then 
  LIST=$(node "$ROOTDIR/bin/_utils/bash-dependency-order.js")
fi 

export CI=true
ALLOW_FAIL=false

# check flags 
for arg in "$@"; do
  # call script with all arguments 
  if [[ $arg == "--allow-fail" ]]; then
    ALLOW_FAIL=true
    echo "allow-fail: on"
  elif [[ $arg == "--root-snapshots" ]]; then
    ROOT_SCREENSHOT=true
    echo "root-screenshot: on"
  elif [[ $arg == "--update-snapshots" ]]; then 
    UPDATE_SNAPSHOTS=true
    echo "update-snapshots: on"
  fi
done

has_cleanup=false
cleanup() {
  # just in case we wrap in IF block, sometimes it seems to trigger twice..
  if [[ $has_cleanup == false ]]; then 
    has_cleanup=true 
    kill $server_pid

    if [[ -f "$ROOTDIR/packages/.temp/.info" ]]; then 
      source $ROOTDIR/packages/.temp/.info 
      if [[ -n "$SERVER_PID" ]]; then 
        kill $SERVER_PID 
      fi 
    fi 

    if [[ -f "$ROOTDIR/.test-fail" ]]; then 
      rm -rf "$ROOTDIR/.test-fail"
      echo "test failed, exit code: 1"
      exit 1
    else
      echo "test successfull, exit code: 0"
      exit 0
    fi
  fi 
}
trap cleanup INT

# start server from "packages"
npx @papit/server -- --port=3500 --location="$ROOTDIR/packages" --critical &
server_pid=$!

sleep 5 # Ensure server starts before reading files

# rm -rf tests/snapshots
# mkdir tests/snapshots

for dir in $LIST; do
  if [[ -f $dir/package.json ]]; then 
    read has_script has_update_script <<< $(node -pe "
      const pkg = require('$dir/package.json'); 
      const hastest = !!pkg.scripts.test;
      const hasupdate = !!pkg.scripts['test:update-snapshots'];
      \`\${hastest} \${hasupdate}\`
    ")

    if [[ "$has_script" == "true" ]]; then 
      cd $dir 
      source .config 
      export LAYER_FOLDER=$LAYER_FOLDER 
      export NAME=$NAME

      echo "FULL_NAME: $FULL_NAME"

      if [[ $has_update_script == "true" ]]; then 
        # if no snapshots we make sure to create them 
        if [[ -n "$UPDATE_SNAPSHOTS" || ! -d "tests/snapshots" ]]; then 
          echo "- update snapshots"
          npm run test:update-snapshots > /dev/null 2>&1

        # Check if there are any matching files
        elif find tests/ -type f -name "snapshot.test.ts" | grep -q '.'; then
          echo "- pre-run snapshots"
          npx playwright test -c tests/playwright.config.ts "tests/.*?/snapshot\.test\.ts" > /dev/null 2>&1
        fi
         
        echo "- finished"
      fi

      echo "- running test"
      npm test 

      # Capture the exit code to determine if the test passed
      test_exit_code=$?
      if [[ $test_exit_code -ne 0 ]]; then
        touch "$ROOTDIR/.test-fail"

        if [[ "$ALLOW_FAIL" == false ]]; then 
          echo ""
          echo "- tests failed"
          break 
        fi
      fi

      # if [[ -n $ROOT_SCREENSHOT ]]; then 
      #   if [[ -d $dir/tests/snapshots ]]; then 
      #     echo "- screenshot copied"
      #     cd $ROOTDIR
      #     mkdir $ROOTDIR/tests/snapshots/$FULL_NAME
      #     cp -R $dir/tests/snapshots $ROOTDIR/tests/snapshots/$FULL_NAME
      #   fi
      # fi
    fi 
  fi 
done

cleanup