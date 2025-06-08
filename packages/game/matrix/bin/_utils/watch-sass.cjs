const chokidar = require("chokidar");
const {exec} = require('node:child_process');

const watcher = chokidar.watch(`${process.env.PACKAGE_DIR}/**/*.scss`, {
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
  exec(`npm run build:sass -- ${path}`, function (error, stdout, stderr) {
    if (error) {
      console.log('[watch sass] error', error, stderr, stdout);
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
async function cleanup() {
  if (cleanupcalls > 0) return;

  console.log('[watch sass] closing');
  await watcher.close();
  console.log('[watch sass] closed');
}
