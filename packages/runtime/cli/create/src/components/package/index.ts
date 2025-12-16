#!/usr/bin/env node

import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import {
  getArguments,
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
import { selectFolder } from "components/select-folder";

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

  Terminal.createSession();
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

  const fullName = `${scope}/${name.package}`;
  const config = getConfig(path.join(folder, ".config"));
  if (!config)
  {
    Terminal.error("could not find .config");
    process.exit();
  }
}