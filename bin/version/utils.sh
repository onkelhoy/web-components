#!/bin/bash

source $ROOTDIR/bin/_utils/common-functions.sh

if [ -z "$PROJECTSCOPE" ]; then 
  PROJECTSCOPE=$(node -e "
    const pkg = require('$ROOTDIR/package.json'); 
    console.log(pkg.name);
  ")
  export PROJECTSCOPE=$(echo "$PROJECTSCOPE" | cut -d'/' -f1 | awk -F'@' '{print $2}')
fi

function npm_search() {
  output=$(get_network_data 10 "npm search --searchlimit=100 @$PROJECTSCOPE --json")

  while IFS= read -r line; do
    if [[ "$line" == npm\ WARN* ]]; then 
      continue  # Skip the warning line
    fi

    if [[ "$line" == npm\ ERR* ]] || [[ "$line" == "__timeout__" ]]; then 
      return 1
    fi

    # If line starts with '[', start collecting JSON data
    if [[ "$line" == "["* ]]; then
      while IFS= read -r json_line; do
        # We will stop when we encounter the closing ']' of the JSON array
        if [[ "$json_line" == *"]" ]]; then
          break
        fi

        if [[ "$json_line" == "," ]] || [[ "$json_line" == "" ]]; then 
          continue
        fi 

        # Process each JSON line with node.js, print the result directly
        node_output=$(node -e "
          const json = JSON.parse(process.argv[1]);
          if (json?.name && json?.version) {
            console.log(\`\${json.name.replace(/[@/\\-]/g, '_')}=\${json.version}\`);
          }
        " "$json_line")

        if [[ -n "$node_output" ]]; then
          echo "$node_output" 
        fi 
      done
      return 0  # Exit after processing JSON array
    fi
  done <<< "$output"
}

function append_remote_version () {
  local remoteversion=$1
  
  # check if something failed (sometimes npm says a package is there but its not..)
  if [[ "$remoteversion" == "npm" ]]; then 
    remoteversion=$localversion
  fi 

  if [ -n $REMOTEVERSION ]; then
    # Variable exists, replace its value
    safe_sed "s/^REMOTEVERSION=.*/REMOTEVERSION=${remoteversion}/" "./.config"
  else
    # Variable doesn't exist, append it to the file
    echo "REMOTEVERSION=${remoteversion}" >> "./.config"
  fi
}


function setupInitiator() {
  local PACKAGE=$1

  if [ -n "$PACKAGE" ]; then 
    name=$(node -e "
      const pkg=require('$PACKAGE/package.json'); 
      console.log(pkg.name)
    ")

    echo "INITIATOR=\"$name\"" > "$ROOTDIR/bin/version/.config"
    INITIATOR="$name"
  else 
    echo "INITIATOR=__SYSTEM__" > "$ROOTDIR/bin/version/.config"
  fi 

  results=$(npm_search)
  status=$?

  if [ "$results" != "__timeout__" ]; then 
    echo "$results" >> "$ROOTDIR/bin/version/.config"
    echo "NPMSEARCH=true" >> "$ROOTDIR/bin/version/.config"
    source "$ROOTDIR/bin/version/.config"

    echo "[NET] npm search success"
  else 
    echo "[NET] failed to do npm search"
  fi 
  # else network failure? - we can try let npm view try anyway and then detect network failure
}

function check_version() {
  local PACKAGE=$1
  local NO_LOCAL_NET_CHECK=$2
  source "$ROOTDIR/bin/version/.config"

  if [[ ! -d "$PACKAGE" ]]; then
    return 3
  fi 

  cd "$PACKAGE"
  source ".config"

  # Using node to execute a one-liner that prints both name and version, separated by a space
  read -r name localversion <<< $(node -pe "let pkg=require('./package.json'); pkg.name + ' ' + pkg.version")

  if [ -z "$PROJECTSCOPE" ]; then 
    export PROJECTSCOPE=$(echo "$name" | cut -d'/' -f1 | awk -F'@' '{print $2}')
  fi

  # always set remote version if not exisiting 
  if [ -z "$REMOTEVERSION" ]; then 
    # echo "am I here, $localversion"
    remoteversion=$localversion # offline support 
    # append_remote_version $localversion
    # return 1 # we need not to update the package 
  fi

  if [ -z "$NETWORK_FAILURE" ]; then 
    env_var_name=$(echo "$name" | sed 's/[\/@\-]/_/g')
    # Check if the variable is set and not empty
    if [ ! -z "${!env_var_name+x}" ]; then
      # Variable is set, access its value
      remoteversion="${!env_var_name}"
      append_remote_version $remoteversion
    elif [ -n "$NO_LOCAL_NET_CHECK" ]; then 
      return 4 
    else
      # could not find the package name in the search (could also be a new package..)
      networkrequest=$(get_network_data 10 "npm view $name version")
      error=0

      while IFS= read -r line; do
        if [[ "$line" == npm\ WARN* ]]; then 
          continue  # Skip the warning line
        fi

        if [[ "$line" == npm\ ERR* ]] || [[ "$line" == "__timeout__" ]]; then 
          error=1
          break  # Error detected
        fi

        if [[ "$line" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
          remoteversion="$line"  # version detected
          break 
        fi
      done <<< "$networkrequest"

      if [[ "$error" -eq 1 ]]; then 
        echo "[NET] $name - error"
        if [ -n "$VERBOSE" ]; then 
          echo "$networkrequest"
          echo ""
        fi 
        if [ -n "$NPMSEARCH" ]; then 
          # we have been able to do the global search 
          # the likelyhood that this is just a new package is very high
          # remoteversion=$localversion
          return 2
        else
          # we have not been able to do a npm search, we can conclude a network failure 
          remoteversion=$REMOTEVERSION

          # we want to source once again to check if another process didnt append the network failure already 
          source "$ROOTDIR/bin/version/.config"

          if [ -z "$NETWORK_FAILURE" ]; then 
            echo "NETWORK_FAILURE=\"true\"" >> "$ROOTDIR/bin/version/.config"
          fi 
        fi
      else 
        echo "[NET] $name local success: $remoteversion"
        echo ""

        # we could fetch the view info 
        append_remote_version $remoteversion
      fi
    fi
  else 
    remoteversion=$REMOTEVERSION
  fi

  if [ "$localversion" == "$remoteversion" ]; then
    return 0 # means we can update 
  fi


  return 1
}