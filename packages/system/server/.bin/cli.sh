

# Get the directory of the current script
SERVERDIR=$(dirname $(dirname "$(realpath "$0")"))

# NOTE: by deafult calling `npx server`
# will execute this file, as defined in package.json under the "bin" section

if [ ! -f "$SERVERDIR/build/run.sh" ]; then 
  npm run build -- --dev
fi

if [ ! -f "$SERVERDIR/build/run.sh" ]; then 
  echo "[error] server build/run.sh file not found"
else 
  sh $SERVERDIR/build/run.sh $@
fi