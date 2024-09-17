import fs from 'node:fs';
import path from 'node:path';

import { IDEPENDENCY, ICallback } from "./types";

export const LOCKFILE = JSON.parse(fs.readFileSync(path.resolve(process.env.ROOTDIR as string, 'package-lock.json')).toString());
export const PACKAGE = JSON.parse(fs.readFileSync(path.resolve(process.env.PACKAGE as string, "package.json")).toString());
export const DEPENDENCY: Record<string, IDEPENDENCY> = {}

const SCOPE = LOCKFILE.name.split("/")[0];

function recursive(name: string, callback?: ICallback) {
  if (!(name.startsWith('@papit') || name.startsWith(SCOPE))) {
    return;
  }

  let package_path = `node_modules/${name}`;
  const resolved_path = LOCKFILE.packages[package_path].resolved;
  if (resolved_path && !resolved_path.startsWith("http")) {  // its locally created
    package_path = resolved_path;
  }


  if (!DEPENDENCY[name]) {
    DEPENDENCY[name] = {
      path: package_path,
      package: JSON.parse(fs.readFileSync(path.resolve(process.env.ROOTDIR as string, package_path, 'package.json')).toString())
    }

    if (callback) {
      callback(name, package_path, DEPENDENCY[name]);
    }
    // iterate the dependencies
    for (let packagename in LOCKFILE.packages[package_path]?.dependencies) {
      recursive(packagename, callback);
    }
    for (let packagename in LOCKFILE.packages[package_path]?.devDependencies) {
      recursive(packagename, callback);
    }
  }
}

export function init(callback: ICallback) {
  for (const dep in PACKAGE.dependencies) {
    recursive(dep, callback);
  }
  for (const dep in PACKAGE.devDependencies) {
    recursive(dep, callback);
  }

  // if (LOCKFILE.packages['node_modules/@papit/translator']) {
  //   recursive('@papit/translator', callback);
  // }
  // else {
  //   console.log("@papit/translator missing from project");
  // }

  return DEPENDENCY;
}