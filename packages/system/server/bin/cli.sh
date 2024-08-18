# Get the directory of the current script
SERVERDIR=$(dirname $(dirname "$(realpath "$0")"))

# NOTE: by deafult calling `npx @papit/server`
# will execute this file, as defined in package.json under the "bin" section

# echo "server-directory: $SERVERDIR"

if [ ! -f "$SERVERDIR/lib/run.sh" ]; then
  echo "[error] server lib/run.sh file not found"
else
  bash $SERVERDIR/lib/run.sh $@
fi