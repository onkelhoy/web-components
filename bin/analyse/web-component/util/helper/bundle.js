const fs = require("node:fs");
const path = require("node:path");
const {spawn} = require('child_process')

const {iterator: src_iterator} = require('./_src.iterator');
const {iterator: dist_iterator} = require('./_dist.iterator');

const LOCKFILE = JSON.parse(fs.readFileSync(path.join(process.env.ROOTDIR, 'package-lock.json')));
const IMPORTS = {};

function runAnalyse(package_path) {
  const args = [];
  if (process.env.VERBOSE) args.push('--verbose');
  if (process.env.FORCE) args.push('--force');

  // // Construct the npm command with arguments
  // const npmCommand = `npm run analyse -- ${args.join(' ')}`;

  // // Use shell to execute the command with cd and npm run
  // const command = `cd ${package_path} && ${npmCommand}`;
  // const child = spawn(command, { shell: true });

  // child.stdout.on('data', (data) => {
  //   printsub(data);
  // });

  // child.stderr.on('data', (data) => {
  //   printsub(data, true);
  // });

  // child.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
}
function printsub(line, error = false) {
  let strline = line;
  if (typeof strline !== "string") strline = String(line);

  const trimmed = strline.trim();
  if (trimmed.startsWith('[ANALYSE]')) {
    if (error) console.log('sub (error):', trimmed);
    else console.log('sub:', trimmed);
  }
  else if (trimmed !== "") {
    console.log('for now:', trimmed);
  }
}

async function getCustomElement(classinfo, called = 0) {
  let prop_info_file = path.join(classinfo.package, 'custom-elements.json');
  if (!fs.existsSync(prop_info_file) || process.env.FORCE) {
    if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - building analyse for', classinfo.name);
    await runAnalyse(classinfo.package);
  }

  if (!fs.existsSync(prop_info_file)) {
    if (process.env.VERBOSE) console.log('[ANALYSE] 🟨 warning - failed to get custom-elements regardless of attempts to execute analyse for', classinfo.name);
    return null;
  }


  if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - found analyse for', classinfo.name);

  let details = JSON.parse(fs.readFileSync(prop_info_file));
  if (details.main.className === classinfo.name) {
    details = details.main;
  }
  else {
    // its one of the subs 
    if (details.sub[classinfo.name]) {
      details = details.sub[classinfo.name];
    }
    else {

      // I guess we should try to rebuild the 
      if (called >= 1) {
        if (process.env.VERBOSE) console.log("[ANALYSE] 🟨 warning - failed to find sub component in custom-elements even after we tried to rebuild analyse");
        return null;
      }

      if (process.env.VERBOSE) console.log("[ANALYSE] 🟨 warning - failed to find sub component in custom-elements, we going to rebuild");

      await runAnalyse(classinfo.package);
      return await getCustomElement(classinfo, called + 1);
    }
  }

  // make sure imports is populated for css extraction
  for (let key in details.imports) {
    try {
      IMPORTS[key] = details.imports[key];
    }
    catch {
      if (process.env.VERBOSE) console.log("[ANALYSE] 🟨 warning - failed to extract import details from IMPORTS", {key, details: details[key]});
    }
  }
  return details;
}

function getLocalModule(name) {
  const scope = LOCKFILE.name.split('/')[0];
  if (!name.startsWith(scope)) return null;

  const data = LOCKFILE.packages[`node_modules/${name}`];
  if (!data) return null;
  if (!data.resolved) return null;
  if (data.resolved.startsWith('http')) return null;

  return path.join(process.env.ROOTDIR, data.resolved);
}

function iterator(classinfo) {
  const info = {
    decorators: {
      property: {},
      query: {},
      context: {},
    },
    imports: [],
    public_functions: [],
    events: []
  };

  dist_iterator(classinfo, info);
  src_iterator(classinfo, info);

  IMPORTS[classinfo.package] = info.imports;

  return info;
}

module.exports = {
  getCustomElement,
  getLocalModule,
  iterator,
  IMPORTS,
}