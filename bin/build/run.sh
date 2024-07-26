#!/bin/bash

export SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sh "$SCRIPTDIR/packages.sh" "$@"

# OBS do not remove !!
# this is a menu and will also extract flags 
# good when build is more then just packages

# note this is commented out because themes was removed 

# # check flags 
# for arg in "$@"; do
#   # call script with all arguments 
#   if [[ $arg == "--theme" ]]; then
#     sh "$SCRIPTDIR/theme.sh" "$@"
#     exit 0
#   elif [[ $arg == "--package" ]]; then
#     sh "$SCRIPTDIR/packages.sh" "$@"
#     exit 0
#   fi
# done

# # if we are here means no flag detected 
# echo "Choose one of the options"
# echo "1. packages"
# echo "2. theme"
# echo ""
# read -p "option: " option_answer

# while [ -z "$option_answer" ]; do
#   logwarn "must choose a option"
#   read -p "option: " option_answer
# done
# echo ""

# if [[ "$option_answer" == "1" ]]; then 
#   sh "$SCRIPTDIR/packages.sh" "$@"
# elif [[ "$option_answer" == "2" ]]; then
#   sh "$SCRIPTDIR/theme.sh" "$@"
# else 
#   echo "You choose none of the options"
# fi

