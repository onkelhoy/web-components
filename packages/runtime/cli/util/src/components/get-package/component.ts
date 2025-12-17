import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { Lockfile, Package } from "./types";

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


export function getPackageInfo() {
  const local = process.cwd();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // get the parent folder of 'lib' if it ends with 'lib'
  const script = path.basename(__dirname) === 'lib'
    ? path.dirname(__dirname)
    : __dirname;

  return {
    root: findWorkspaceRoot(local),
    local,
    script,
  }
}