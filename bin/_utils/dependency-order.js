const path = require('node:path');

// Global storage for package relationships
const map = {};
// Set to keep track of remaining packages to process
const set = new Set();

// Function to initialize the package relationships
function initializePackages(ROOTDIR, LOCKFILE) {
  const SCOPE = (LOCKFILE.name || '@papit/he').split('/')[0];
  for (const name in LOCKFILE.packages) {
    if (name.startsWith(`node_modules/${SCOPE}`)) {
      const mapname = name.split("node_modules/")[1];
      if (!map[mapname]) map[mapname] = {dep: [], has: []};

      set.add(mapname);

      const packagejson = LOCKFILE.packages[LOCKFILE.packages[name].resolved];
      if (!packagejson) {
        console.log('failed', name, packagejson, LOCKFILE.packages[name].resolved)
        continue;
      }

      const dependencies = [];

      map[mapname].location = path.join(ROOTDIR, LOCKFILE.packages[name].resolved);
      map[mapname].version = packagejson.version;

      for (const dep in packagejson.dependencies) {
        if (dep.startsWith(SCOPE) && dep !== mapname) {
          if (!map[dep]) map[dep] = {dep: [], has: []};
          map[dep].has.push(mapname);
          dependencies.push(dep);
        }
      }

      map[mapname].dep = dependencies;
    }
  }
}

// Asynchronous generator function to yield batches of package names
function* batchIterator(print) {
  while (set.size > 0) {
    const list = [];
    const arr = Array.from(set);

    for (const name of arr) {
      if (map[name].dep.length === 0) {
        set.delete(name);
        list.push({name, location: map[name].location, version: map[name].version});
      }
    }

    if (list.length > 0) {
      if (print) console.log(`package-batch, size=${list.length}`);
      yield list;
    }

    for (const info of list) {
      // Remove this package as a dependency for the rest
      for (const other of map[info.name].has) {
        map[other].dep = map[other].dep.filter(n => n !== info.name);
      }
    }
  }
}

// Function to iterate over batches and execute a given function
async function iterate(execute, print = true) {
  for (const batch of batchIterator(print)) {
    await execute(batch);
    if (print) console.log('');
  }
}

function iterateSync(execute, print = false) {
  for (const batch of batchIterator(print)) {
    execute(batch);
  }
}

// Export the iterate function
module.exports = {
  initializePackages,
  iterate,
  iterateSync,
};
