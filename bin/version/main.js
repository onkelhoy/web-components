const path = require('node:path');
const fs = require('node:fs');
const {spawn} = require('node:child_process');

function updateVersion(name, cwd) {
  if (VERSIONINGJSON[name]) {
    return;
  }
  return new Promise((resolve) => {
    const npmUpdate = spawn('npm', ['version', 'patch'], {cwd, env: {...process.env}});

    let stdoutData = '';
    let stderrData = '';

    npmUpdate.stdout.on('data', (data) => {
      const str = data.toString();
      const trimmed = str.trim();
      stdoutData += trimmed;
      if (trimmed !== "" && trimmed.startsWith("## [")) {
        if (VERSIONINGJSON.initiator === TARGET_PACKAGE) {
          console.log(trimmed.replace("## ", ""));
        }
        else {
          console.log(trimmed);
        }
      }
    });

    npmUpdate.stderr.on('data', (data) => {
      const trimmed = data.toString().trim();
      if (trimmed !== "") {
        stderrData += trimmed + "\n";
      }
    });

    npmUpdate.on('close', (code) => {
      if (code === 3) {
        // if (!VERSIONINGJSON[name]) console.log(`## [${name}]: SKIPPED`)
        saveVersioning(name);
        // skipped
      }
      else if (code === 4) {
        saveVersioning(name);
      }
      else {
        console.log('[ERROR]\t', stderrData);
      }
      resolve();
    });
  });
}

function saveVersioning(name) {
  VERSIONINGJSON[name] = true;
  fs.writeFileSync(VERSIONINGPATH, JSON.stringify(VERSIONINGJSON));
}

// variabels 
const ROOTDIR = process.env.ROOTDIR;
const TARGET_PACKAGE = process.env.TARGET_PACKAGE;
const VERSIONINGPATH = path.join(process.env.SCRIPTDIR, '.json');
const VERSIONINGJSON = JSON.parse(fs.readFileSync(VERSIONINGPATH));
const LOCKFILE = JSON.parse(fs.readFileSync(path.join(ROOTDIR, 'package-lock.json')));
const PACKAGE_DIR = path.join(ROOTDIR, LOCKFILE.packages[`node_modules/${TARGET_PACKAGE}`].resolved);

const targetpackage = JSON.parse(fs.readFileSync(path.join(PACKAGE_DIR, 'package.json')));

async function init() {
  if (targetpackage) {
    // get version 
    const VERSION = targetpackage.version;

    try {
      let readme = fs.readFileSync(path.join(PACKAGE_DIR, 'README.md'), 'utf-8');
      let oldversion = readme.match(/version:(.+)/i);
      if (oldversion) {
        oldversion = oldversion[1].replace('Version:', '').trim();
        if (VERSIONINGJSON.initiator === TARGET_PACKAGE) {
          console.log(`[${TARGET_PACKAGE}]: ${oldversion} -> ${VERSION}`)
        }
        else {
          console.log(`## [${TARGET_PACKAGE}]: ${oldversion} -> ${VERSION}`)
        }
        readme = readme.replace(oldversion, VERSION);
        fs.writeFileSync(path.join(PACKAGE_DIR, 'README.md'), readme, 'utf-8');
      }
    }
    catch (e) {
      console.log('[WARN] could not find README to update version');
    }

    // now save the lockfile 
    for (let name in LOCKFILE.packages) {
      if (!name.startsWith('packages/')) continue;

      for (let deptype of ['dependencies', 'devDependencies']) {
        for (let depname in LOCKFILE.packages[name][deptype]) {
          if (depname !== TARGET_PACKAGE) continue;

          const package_info = LOCKFILE.packages[`node_modules/${LOCKFILE.packages[name]?.name}`];
          if (!package_info) continue;

          const component_path = path.join(ROOTDIR, package_info.resolved);
          const package_path = path.join(component_path, 'package.json');
          const PACKAGE = JSON.parse(fs.readFileSync(package_path));
          PACKAGE[deptype][TARGET_PACKAGE] = VERSION;
          fs.writeFileSync(package_path, JSON.stringify(PACKAGE, null, 2), 'utf-8');

          if (deptype === 'dependencies' && process.env.GLOBAL_PUBLISH !== "true") {
            // need to now call npm version patch for this package 
            await updateVersion(LOCKFILE.packages[name]?.name, component_path);
          }
        }
      }
    }
  }
}

init();