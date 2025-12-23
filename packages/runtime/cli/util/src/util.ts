import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

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


export function getPathInfo(location?: string, importurl?: string) {
  const local = location ?? process.cwd();

  return {
    root: findWorkspaceRoot(local),
    local,
    script: getScriptPackageLocation(importurl),
  }
}

export function getScriptPackageLocation(url = import.meta.url) {
  const __filename = fileURLToPath(url);
  let __dirname = __filename;

  // get the parent folder of 'lib' if it ends with 'lib'
  for (let i = 0; i < 5; i++)
  {
    __dirname = dirname(__dirname);
    if (!fs.existsSync(join(__dirname, "package.json"))) continue;

    return __dirname;
  }

  return null;
}