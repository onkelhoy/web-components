import path, { join } from "node:path";
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
  getScriptScope,
} from "@papit/cli-util"
import { getFolders, selectFolder } from "components/util";

const execAsync = promisify(exec);

export async function runner(scriptdir: string) {
  const session = Terminal.createSession();

  const info = getPackageInfo();
  const scope = getScope();
  const folder = await selectFolder({
    ...info,
    scope,
  });

  const config = getConfig(path.join(folder, ".config"));
  if (!config)
  {
    Terminal.error("could not find .config");
    process.exit();
  }

  let lockfile = getJSON<Lockfile>(path.join(info.root, "package-lock.json"));
  if (lockfile === null)
  {
    await execAsync('npm install');
    lockfile = getJSON<Lockfile>(path.join(info.root, "package-lock.json"));
  }

  Terminal.clearSession(session); // this will also create session
  let name: ReturnType<typeof getName> = undefined;
  while (true)
  {
    Terminal.clearSession();
    const input = await Terminal.prompt("name", true);
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

  const destination = join(folder, name.safe);

  
  const fullName = `${scope}/${name.package}`;
  const description = await Terminal.prompt("Description");
  Terminal.clearSession();

  const template = await Terminal.option(getFolders(path.join(scriptdir, "asset/package-templates/")));
  Terminal.clearSession();

  

  Terminal.write(`${fullName} created`);

  const npminstall = await Terminal.confirm("install package");
  if (npminstall)
  {
    await execAsync('npm install');
    Terminal.clearSession();
  }

  const commit = await Terminal.confirm("git commit");
  if (commit)
  {
    await execAsync(`git add `);
  }
}