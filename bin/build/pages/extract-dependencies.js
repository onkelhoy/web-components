const fs = require("node:fs");
const path = require("node:path");

const SKIPS = ["tslib"];
const LOCKFILE = JSON.parse(fs.readFileSync(path.join(process.env.ROOTDIR, "package-lock.json")));
const pages = process.env.PAGE_PATHS.split(",");
const dependencies = {};

function reqursiveDependency(name) {
  if (dependencies[name]) return
  if (SKIPS.includes(name)) return; // can be expanded to cover more 

  const lockname = `node_modules/${name}`;
  let _dependencies = [];
  let location = "";

  if (LOCKFILE.packages[lockname].dependencies || LOCKFILE.packages[lockname].resolved.startsWith("https://registry.npmjs.org")) {
    // its installed and exists inside "node_modules"
    location = lockname;
    _dependencies = LOCKFILE.packages[lockname].dependencies
  }
  else {
    // its a local package 
    const packagejson = LOCKFILE.packages[LOCKFILE.packages[lockname].resolved];
    if (!packagejson) {
      console.log('ERROR:', lockname, packagejson, LOCKFILE.packages[lockname].resolved);
      return;
    }

    _dependencies = packagejson.dependencies;
    location = LOCKFILE.packages[lockname].resolved;
  }


  for (let dependency in _dependencies) {
    reqursiveDependency(dependency);
  }

  // this makes sure the packages that are first have 0 dependency and so on.. 
  dependencies[name] = path.join(process.env.ROOTDIR, location);
}

// RUNNER 
for (let pagePath of pages) {
  const package = JSON.parse(fs.readFileSync(path.join(pagePath, "package.json")));

  for (let dependency in package.dependencies) {
    reqursiveDependency(dependency);
  }
}

const basePackages = ["@papit/core", "@papit/router", "@papit/translator", "@papit/theme-core"]; // maybe we should be able to list all available themes and use another one? (- though core needs to exist)
for (let base of basePackages) {
  // router needs to be added ! - this could cause problems if router is not installed 
  if (!dependencies[base]) {
    reqursiveDependency(base);

    if (!dependencies[base]) {
      console.log(`ERROR: cannot establish "${base}" - make sure to install it in one of the pages - home would be good`);
      return;
    }
  }
}

console.log(Array.from(Object.values(dependencies)).join(","));