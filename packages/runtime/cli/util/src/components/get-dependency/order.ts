import path from 'node:path';

import { getScope } from "../get-scope";
import { Arguments } from "../arguments";
import { getRemotePackage, getRemotePackages, LocalPackage, Lockfile, RemotePackages, } from "../get-package";
import { getPathInfo } from "../../util";
import { Batch, Config, getBasicConfig } from './util';
import { Terminal } from 'components/terminal';


type MinimalMap = { 
  changedversion?: boolean; 
  location?: string; 
  version?: string; 
  dep: string[]; 
  has: string[]; 
}

// Function to initialize the package relationships
export async function init(
  info: ReturnType<typeof getPathInfo>,
  lockfile: Lockfile,
  scope = getScope(),
  acceptance?: Set<string>,
  remotePackages?: RemotePackages|null
) {
  const map: Record<string, MinimalMap> = {};
  const set = new Set<string>();
  const updatedpackages = new Set<string>();

  for (const key in lockfile.packages) {
    if (!key.startsWith("packages")) continue;
    
    const pkg = lockfile.packages[key] as LocalPackage;
    const name = pkg.name;

    if (!name.startsWith(scope)) continue;
    if (pkg.workspaces) continue;
    if (name === `${scope}/root`) continue;
    if (acceptance && !acceptance.has(name)) continue;

    const location = path.join(info.root, key);

    if (!map[name]) map[name] = { dep: [], has: [] };

    set.add(name);

    const dependencies = [];

    map[name].location = location;
    map[name].version = pkg.version;

    if (Arguments.args.flags['check-version']) {

      let versionchanged = false;
      if (remotePackages)
      {
        const find = remotePackages.objects.find(p => p.package.name === pkg.name);
        if (find) 
        {
          versionchanged = find.package.version === pkg.version;
        }
        else 
        {
          versionchanged = true;
        }
      }

      if (!versionchanged && pkg.remoteVersion)
      {
        versionchanged = pkg.remoteVersion === pkg.version;
      }
      
      if (Arguments.info)
      {
        Terminal.write(Terminal.colorWrap(`"${pkg.name}" version ${versionchanged ? "changed" : "same"}`, "blue"));
      }

      if (versionchanged && !Arguments.args.flags['version-change']) 
      {
        continue;
      }
    }

    for (const dep in pkg.dependencies) {
      if (!dep.startsWith(scope) || dep === name) continue;

      if (!map[dep]) map[dep] = { dep: [], has: [] };
      map[dep].has.push(name);
      dependencies.push(dep);
    }

    for (const dep in pkg.peerDependencies) {
      if (!dep.startsWith(scope) || dep === name) continue;

      if (!map[dep]) map[dep] = { dep: [], has: [] };
      map[dep].has.push(name);
      dependencies.push(dep);
    }

    map[name].dep = dependencies;
  }

  // perhaps we need a flag to make sure certain things exists at build time 

  return { map, set };
  // version clensing step s
  // if (!Arguments.args.flags['check-version']) return { map, set };

  // const newmap: Record<string, MinimalMap> = {};
  // set.clear();

  // // ADD packages here you need to make sure exists 
  // //  in case of papit repo server is called via npx but I suspect since it exists in package-lock 
  // //  it wants to call it locally.. 
  // // if (process.env.CI == "true") {
  // //   if (map["@papit/server"]) {
  // //     newmap["@papit/server"] = map["@papit/server"];
  // //     set.add("@papit/server")
  // //   }
  // // }

  // function reqursive(name: string) {
  //   if (newmap[name]) return; // already fixed;
  //   const info = map[name];
  //   if (!info) return;

  //   set.add(name);
  //   newmap[name] = info;
  //   info.dep.forEach(reqursive);
  // }
  // // lets clean the bloodlines
  // const packages = Array.from(updatedpackages);
  // for (let name of packages) {
  //   reqursive(name);
  // }

  // return {map:newmap, set}; // finally we simply replace
}

// Asynchronous generator function to yield batches of package names
export function* generator(
  {set, map}: Awaited<ReturnType<typeof init>>, 
): Generator<Batch[], void, unknown> {
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
      if (Arguments.verbose) console.log(`package-batch, size=${list.length}`);
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


export async function getDependencyOrder(
  executor:(batch: Batch[]) => Promise<void>, 
  config: Partial<Config> = {}
) {

  
  const { info, scope, lockfile, acceptance } = getBasicConfig(config);
  const remotePackages = await getRemotePackages(scope);

  const data = await init(info, lockfile, scope, acceptance, remotePackages);

  for (const batch of generator(data)) {
    await executor(batch);
  }

  return data;
}