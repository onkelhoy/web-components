const chokidar = require("chokidar");
const {exec} = require('node:child_process');

const watcher = chokidar.watch(`${process.env.PACKAGE_DIR}/**/*.scss`, {
  ignored: /.*\.skip\.scss$/,
  persistent: true
});

watcher
  .on('add', build)
  .on('change', build)
  .on('unlink', filePath => console.log(`[sass] file removed: ${filePath}`))
  .on('error', error => console.error(`[sass] error: ${error}`));

function build(path) {
  console.log(`[sass] change: ${path}`);
  exec(`npm run build:sass ${path}`);
}