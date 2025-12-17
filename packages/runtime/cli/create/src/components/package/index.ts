import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import {
  getJSON,
  getScope,
  getPackage,
  getName,
  copyFolder,
  Terminal,
  getPackageInfo,
  type Lockfile,
  getConfig,
} from "@papit/cli-util"
import { getFolders, selectFolder } from "components/select-folder";

const execAsync = promisify(exec);

export async function runner() {

  const info = getPackageInfo();
  const scope = getScope();
  const folder = await selectFolder({
    ...info,
    scope,
  });

  let lockfile = getJSON<Lockfile>(path.join(info.root, "package-lock.json"));
  if (lockfile === null)
  {
    await execAsync('npm install');
    lockfile = getJSON<Lockfile>(path.join(info.root, "package-lock.json"));
  }

  Terminal.clearSession(); // this will also create session
  let name: ReturnType<typeof getName> = undefined;
  while (true)
  {
    Terminal.clearSession();
    const input = await Terminal.prompt("package name");
    name = getName(input);

    if (!name) 
    {
      Terminal.write("name missing, try again");
      continue;
    }
    if (lockfile && getPackage(`${scope}/${name.safe}`, lockfile))
    {

      Terminal.write("package already exists, try again")
      continue;
    }

    break;
  }

  Terminal.clearSession();
  
  const fullName = `${scope}/${name.package}`;
  Terminal.write()
  Terminal.write("full name:", fullName);
  Terminal.write("component:", name.component);
  Terminal.write("package:", name.package);
  Terminal.write("safe:", name.safe);
  Terminal.write()
  
  const config = getConfig(path.join(folder, ".config"));
  if (!config)
  {
    Terminal.error("could not find .config");
    process.exit();
  }

  const description = await Terminal.prompt("Description");

  Terminal.write()
  const template = await Terminal.option(getFolders(path.join(info.script, "asset/package-templates/")));


  // Terminal.clearSession();
}