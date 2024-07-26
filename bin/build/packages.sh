#!/bin/bash

SCRIPTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sh $SCRIPTDIR/../publish/run.sh --skip-semantic --force