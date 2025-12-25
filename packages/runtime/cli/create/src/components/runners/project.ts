import path from "node:path";
import fs from "node:fs";
import { exec, execSync } from "node:child_process";
import { promisify } from "node:util";

import {
  Terminal,
  copyFolder,
  getPathInfo,
  Arguments,
} from "@papit/util-cli"
const execAsync = promisify(exec);

export async function runner(info: ReturnType<typeof getPathInfo>, packageLocation?: string) {
  Terminal.write("Project Creation\n")
  Terminal.createSession();
  let linebetween = false;
  let name:string;
  if (typeof Arguments.args.flags.name === "string")
    name = Arguments.args.flags.name; 
  else 
  {
    name = await Terminal.prompt("name", true);
    linebetween = true;
  }

  let location:string;
  if (typeof Arguments.args.flags.location === "string")
    location = Arguments.args.flags.location; 
  else 
  {
    if (linebetween) Terminal.write();
    location = await Terminal.prompt("location");
    linebetween = true;
  }

  await Terminal.sessionBlock(async () => {
    if (!fs.existsSync(location)) return;
    console.log();
    console.log(`provided location already exists: [${location}]`)
    const canremove = await Terminal.confirm("confirm to remove it");
    if (canremove)
    {
      fs.rmSync(location, { recursive: true, force: true });
    }
    else 
    {
      Terminal.error("must choose a empty location");
      process.exit();
    }
  });

  fs.mkdirSync(location, { recursive: true });

  let description:string;
  if (typeof Arguments.args.flags.description === "string")
    description = Arguments.args.flags.description;
  else 
  {
    if (linebetween) Terminal.write();
    description = await Terminal.prompt("description");
    linebetween = true;
  }

  let license:string;
  if (typeof Arguments.args.flags.license === "string")
    license = Arguments.args.flags.license;
  else 
  {
    if (linebetween) Terminal.write();
    license = await Terminal.prompt("license (default MIT)");
    linebetween = true;
  }

  let licensefilelocation:string;
  if (license)
  {
    if (typeof Arguments.args.flags.licensefilelocation === "string")
      licensefilelocation = Arguments.args.flags.licensefilelocation;
    else 
    {
      if (linebetween) Terminal.write();
      licensefilelocation = await Terminal.prompt("license file location");
      linebetween = true;
    }

    if (fs.existsSync(licensefilelocation)) 
    {
      fs.copyFileSync(licensefilelocation, path.join(location, 'LICENSE'));
    }
  }

  Terminal.clearSession();

  const initgit = Arguments.args.flags.git === "true" || await Terminal.confirm("init with git?");
  if (initgit)
  {
    await execSync("git init", { cwd: location });
  }

  
  // Copy package template
  await copyFolder(path.join(info.script!, "asset/project-template"), location, async (file, src) => {
    if (src.endsWith(".gitkeep")) return false;
    
    const final = file
      .replace(/VARIABLE_NAME/g, `@${name}/root`)
      .replace(/VARIABLE_DESCRIPTION/g, description)
      .replace(/VARIABLE_PROJECTLICENSE/g, license || "MIT")
      .replace(/VARIABLE_USER/g, process.env.USER ?? "anonymous");

    return final;
  });

  if (initgit)
  {
    await execSync("git add .", { cwd: location });
    await execSync(`git commit -m "init: ${name} initialized"`, { cwd: location });
  }
}