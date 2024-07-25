# Get the directory of the current script
SERVERDIR=$(dirname $(dirname "$(realpath "$0")"))

# NOTE: by deafult calling `npx @papit/server`
# will execute this file, as defined in package.json under the "bin" section

echo "server-directory: $SERVERDIR"

if [ ! -f "$SERVERDIR/build/run.sh" ]; then
  echo "[error] server build/run.sh file not found"
else
  sh $SERVERDIR/build/run.sh $@
fi