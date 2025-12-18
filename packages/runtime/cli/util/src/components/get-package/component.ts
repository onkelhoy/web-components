import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { Lockfile, Package } from "./types";

import { getConfig } from "components/get-config";

export function getPackage(fullPackageName: string, lockfile: Lockfile): Package | null {
  if (!lockfile) return null;

  const linkedPackage = lockfile.packages[`node_modules/${fullPackageName}`];
  if (!linkedPackage) return null;
  if (!('link' in linkedPackage)) throw Error("requested package is not local");

  return lockfile.packages[linkedPackage.resolved] as Package;
}

function findWorkspaceRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir))
  { // stop at filesystem root
    if (fs.existsSync(path.join(dir, "package.json")))
    {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf-8"));
      if (pkg.workspaces) return dir; // found monorepo root
    }
    dir = path.dirname(dir);
  }
  return startDir; // fallback
}


export function getPackageInfo(location?: string) {
  const local = location ?? process.cwd();

  return {
    root: findWorkspaceRoot(local),
    local,
    script: getScriptScope(),
  }
}

export function getScriptScope(url = import.meta.url) {
  const __filename = fileURLToPath(url);
  let __dirname = __filename;

  // get the parent folder of 'lib' if it ends with 'lib'
  for (let i = 0; i < 5; i++)
  {
    __dirname = dirname(__dirname);
    const config = getConfig(join(__dirname, ".config"));
    if (!config) continue;
    if (!config.PACKAGE_NAME) continue;

    return __dirname;
  }

  return null;
}