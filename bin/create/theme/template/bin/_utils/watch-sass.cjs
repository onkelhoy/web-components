const chokidar = require("chokidar");
const {exec} = require('node:child_process');
const fs = require("node:fs");

const watcher = chokidar.watch(`${process.env.PACKAGE_DIR}/styles/*.scss`, {
  ignored: /.*\.skip\.scss$/,
  persistent: true
});

const debounce = (execute, delay = 100) => {
  let timer = null;

  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      execute(...args);
      timer = null;
    }, delay);
  };
}

function build_func(path, stat) {
  if (!stat) {
    console.log(`[watch sass] change: ${path}`);
  }
  exec('npm run build -- --dev', function (error, stdout, stderr) {
    if (error) {
      console.log('[watch sass] error', error, stderr, stdout);
    }
    else {
      if (process.env.VIEW) {
        fs.copyFile("lib/style.css", `views/${process.env.VIEW}/build.css`, function (error) {
          if (error) console.log('[watch sass] copy file error', error);
        });
      }
    }

    console.log('[watch sass] build finished')
  });
};

const build = debounce(build_func);

watcher
  .on('add', build)
  .on('change', build)
  .on('unlink', filePath => console.log(`[watch sass] file removed: ${filePath}`))
  .on('error', error => console.error(`[watch sass] error: ${error}`));


process.on('EXIT', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

let cleanupcalls = 0;
function cleanup() {
  if (cleanupcalls > 0) return;

  console.log('[watch sass] closed')
  watcher.close();
}
