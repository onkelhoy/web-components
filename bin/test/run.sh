#!/bin/bash

# initiate variables 
export ROOTDIR=$(pwd)

export CI=true # why this always set ? 
ALLOW_FAIL=false
CHECKVERSION=false 

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
  elif [[ $arg == "--force" ]]; then
    # this should skip the check if version is not same and build the ancestor tree 
    export FORCE=true
    echo "force: on"
  fi
done

bash "$ROOTDIR/bin/dependency-order/run.sh" --check-version
LIST=$(cat "$ROOTDIR/bin/dependency-order/list")

has_cleanup=false
cleanup() {
  # just in case we wrap in IF block, sometimes it seems to trigger twice..
  if [[ $has_cleanup == false ]]; then 
    has_cleanup=true 
    kill $server_pid

    rm "$ROOTDIR/bin/version/.config" &> /dev/null
    rm "$ROOTDIR/bin/version/.json" &> /dev/null
    rm "$ROOTDIR/bin/dependency-order/list" &> /dev/null

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

echo "$LIST" | while IFS=' ' read -r name package version changed; do

  if [[ $changed -eq 0 ]]; then 
    echo "versions are same: skipped"
    continue
  fi
  
  if [[ ! -f $package/package.json ]]; then 
    continue 
  fi 

  read -r TESTS_EXIST UPDATE_SNAPSHOT_EXISTS <<< $(node -pe "
    const pkg = require('$package/package.json'); 
    const hastest = !!pkg.scripts.test;
    const hasupdate = !!pkg.scripts['test:update-snapshots'];
    \`\${hastest} \${hasupdate}\`
  ")

  if [[ "$TESTS_EXIST" != "true" ]]; then 
    continue
  fi 

  cd $package 
  source .config 
  export LAYER_FOLDER=$LAYER_FOLDER 
  export NAME=$NAME
  echo "::group::$FULL_NAME"

  if [[ -n "$SKIP_SNAPSHOT" ]]; then 
    if [[ $UPDATE_SNAPSHOT_EXISTS == "true" ]]; then 
      # if no snapshots we make sure to create them 
      if [[ -n "$UPDATE_SNAPSHOTS" || ! -d "tests/snapshots" ]]; then 
        echo "- update snapshots"
        npm run test:update-snapshots > /dev/null 2>&1

      # Check if there are any matching files
      elif find tests/ -type f -name "snapshot.test.ts"; then
        echo "- pre-run snapshots"
        npx playwright test -c tests/playwright.config.ts "tests/.*?/snapshot\.test\.ts" > /dev/null 2>&1
      fi
        
      echo "- finished"
    fi
  fi

  echo "- running test"
  npm test 

  # Capture the exit code to determine if the test passed
  test_exit_code=$?
  if [[ $test_exit_code -ne 0 ]]; then

    # try rerun on failed tests to see if potential timing issue was the culprit (router had several such)
    npm test -- --last-failed
    rerun_exit_code=$?

    if [[ $rerun_exit_code -ne 0 && "$ALLOW_FAIL" == false ]]; then 
      touch "$ROOTDIR/.test-fail"
      echo ""
      echo "- tests failed"
      echo "::endgroup::"
      break 
    fi
  fi
  echo "::endgroup::"

  # if [[ -n $ROOT_SCREENSHOT ]]; then 
  #   if [[ -d $package/tests/snapshots ]]; then 
  #     echo "- screenshot copied"
  #     cd $ROOTDIR
  #     mkdir $ROOTDIR/tests/snapshots/$FULL_NAME
  #     cp -R $package/tests/snapshots $ROOTDIR/tests/snapshots/$FULL_NAME
  #   fi
  # fi
done

cleanup