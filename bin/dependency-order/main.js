const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Global storage for package relationships
let map = {};
// Set to keep track of remaining packages to process
const set = new Set();
// Store the updated packages so we can only iterate those and their blood-line(?) : both ancestor and decendents 

const versionExtractLocation = path.join(process.env.ROOTDIR, "bin/version/utils.sh");

// Function to initialize the package relationships
function initializePackages(ROOTDIR, LOCKFILE, CHECKVERSION) {
  const SCOPE = (LOCKFILE.name || '@papit/he').split('/')[0];

  map = {};
  set.clear();
  const updatedpackages = new Set();

  for (const name in LOCKFILE.packages) {
    if (name.startsWith(`node_modules/${SCOPE}`)) {
      const mapname = name.split("node_modules/")[1];
      if (!map[mapname]) map[mapname] = { dep: [], has: [] };

      set.add(mapname);

      const packagejson = LOCKFILE.packages[LOCKFILE.packages[name].resolved];
      if (!packagejson) {
        console.log('failed', name, packagejson, LOCKFILE.packages[name].resolved)
        continue;
      }

      const dependencies = [];

      map[mapname].location = path.join(ROOTDIR, LOCKFILE.packages[name].resolved);
      map[mapname].version = packagejson.version;

      if (CHECKVERSION) {
        const args = [
          "-c",
          `source ${versionExtractLocation} && check_version "${map[mapname].location}" "1"`
        ];
        const { status } = spawnSync("bash", args, {
          stdio: "inherit",
        });

        if (status != 0) {
          updatedpackages.add(mapname);
          map[mapname].changedversion = 1;
        }
        else {
          map[mapname].changedversion = 0;
        }
      }

      for (const dep in packagejson.dependencies) {
        if (dep.startsWith(SCOPE) && dep !== mapname) {
          if (!map[dep]) map[dep] = { dep: [], has: [] };
          map[dep].has.push(mapname);
          dependencies.push(dep);
        }
      }

      map[mapname].dep = dependencies;
    }
  }

  // version clensing step 
  if (CHECKVERSION) {

    const newmap = {};
    set.clear();

    // ADD packages here you need to make sure exists 
    //  in case of papit repo server is called via npx but I suspect since it exists in package-lock 
    //  it wants to call it locally.. 
    if (process.env.CI == "true") {
      if (map["@papit/server"]) {
        newmap["@papit/server"] = map["@papit/server"];
        set.add("@papit/server")
      }
    }

    function reqursive(name) {
      if (newmap[name]) return; // already fixed;
      const info = map[name];
      if (!info) return;

      set.add(name);
      newmap[name] = info;
      info.dep.forEach(reqursive);
    }
    // lets clean the bloodlines
    const packages = Array.from(updatedpackages);
    for (let name of packages) {
      reqursive(name);
    }

    map = newmap; // finally we simply replace
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
        list.push({ name, location: map[name].location, version: map[name].version, changedversion: map[name].changedversion });
      }
    }

    if (list.length > 0) {
      if (print) console.log(`package-batch, size=${list.length}`);
      yield list;
    }

    for (const info of list) {
      // Remove this package as a dependency for the rest
      for (const other of map[info.name].has) {
        // we have to check if we have other in case we have filtered out some packages from the map in the version clensing step 
        if (map[other]) {
          map[other].dep = map[other].dep.filter(n => n !== info.name);
        }
      }
    }
  }
}

// Function to iterate over batches and execute a given function
async function iterate(execute, print = true) {
  for (const batch of batchIterator(print)) {
    await execute(batch);
    if (print) console.log(''); // create empty line 0,s
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
