import path from 'node:path';

import { getScope } from "../get-scope";
import { getArguments } from "../get-arguments";
import { LocalPackage, Lockfile, } from "../get-package";
import { getPathInfo } from "../../util";


// Global storage for package relationships
// let map = {};
// Set to keep track of remaining packages to process
// const set = new Set();
// Store the updated packages so we can only iterate those and their blood-line(?) : both ancestor and decendents 


type MinimalMap = { 
  changedversion?: boolean; 
  location?: string; 
  version?: string; 
  dep: string[]; 
  has: string[]; 
}

type Batch = {
  name: string;
  location: string | undefined;
  version: string | undefined;
  changedversion: boolean | undefined;
}

// Function to initialize the package relationships
export function getDependencyOrder(
  info: ReturnType<typeof getPathInfo>,
  lockfile: Lockfile,
  args: ReturnType<typeof getArguments>,
  scope = getScope()
) {
  const map: Record<string, MinimalMap> = {};
  const set = new Set<string>();
  const updatedpackages = new Set<string>();

  for (const key in lockfile.packages) {
    if (!key.startsWith("packages") || !lockfile.packages[key].name?.startsWith(scope)) continue;

    const pkg = lockfile.packages[key] as LocalPackage;
    const name = pkg.name;
    const location = path.join(info.root, key);

    if (!map[name]) map[name] = { dep: [], has: [] };

    set.add(name);

    // const pkg = lockfile.packages[lockfile.packages[name].resolved];
    // if (!pkg) {
    //   console.log('failed', name, pkg, lockfile.packages[name].resolved)
    //   continue;
    // }

    const dependencies = [];

    map[name].location = location;
    map[name].version = pkg.version;

    if (args.flags['check-version']) {
      // const args = [
      //   "-c",
      //   `source ${versionExtractLocation} && check_version "${map[name].location}" "1"`
      // ];
      // const { status } = spawnSync("bash", args, {
      //   stdio: "inherit",
      // });

      // if (status != 0) {
      //   updatedpackages.add(name);
      //   map[name].changedversion = true;
      // }
      // else {
      //   map[name].changedversion = false;
      // }
    }

    for (const dep in pkg.dependencies) {
      if (!dep.startsWith(scope) || dep === name) continue;

      if (!map[dep]) map[dep] = { dep: [], has: [] };
      map[dep].has.push(name);
      dependencies.push(dep);
    }

    map[name].dep = dependencies;
  }

  // version clensing step 
  if (!args.flags['check-version']) return { map, set };

  const newmap: Record<string, MinimalMap> = {};
  set.clear();

  // ADD packages here you need to make sure exists 
  //  in case of papit repo server is called via npx but I suspect since it exists in package-lock 
  //  it wants to call it locally.. 
  // if (process.env.CI == "true") {
  //   if (map["@papit/server"]) {
  //     newmap["@papit/server"] = map["@papit/server"];
  //     set.add("@papit/server")
  //   }
  // }

  function reqursive(name: string) {
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

  return {map:newmap, set}; // finally we simply replace
}

// Asynchronous generator function to yield batches of package names
function* batchIterator({ set, map }: ReturnType<typeof getDependencyOrder>, print = false): Generator<Batch[], void, unknown> {
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
export async function iterate(
  info: ReturnType<typeof getDependencyOrder>, 
  execute:(batch: Batch[]) => Promise<void>, 
  print = true
) {
  for (const batch of batchIterator(info, print)) {
    await execute(batch);
  }
}
