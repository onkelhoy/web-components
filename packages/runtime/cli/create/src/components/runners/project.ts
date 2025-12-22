import path from "node:path";
import fs from "node:fs";

import {
  Terminal,
  getPackageInfo,
  getConfig,
  getArguments,
  copyFolder,
} from "@papit/cli-util"
import { getFolders } from "components/util";

export async function runner(scriptdir: string, args: ReturnType<typeof getArguments>, packageLocation?: string) {
  Terminal.write("Project Creation\n")
  let linebetween = false;
  let name:string;
  if (typeof args.flags.name === "string")
    name = args.flags.name; 
  else 
  {
    name = await Terminal.prompt("name", true);
    linebetween = true;
  }

  let location:string;
  if (typeof args.flags.location === "string")
    location = args.flags.location; 
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
  if (typeof args.flags.description === "string")
    description = args.flags.description;
  else 
  {
    if (linebetween) Terminal.write();
    description = await Terminal.prompt("description");
    linebetween = true;
  }

  let license:string;
  if (typeof args.flags.license === "string")
    license = args.flags.license;
  else 
  {
    if (linebetween) Terminal.write();
    license = await Terminal.prompt("license (default MIT)");
    linebetween = true;
  }

  let licensefilelocation:string;
  if (license)
  {
    if (typeof args.flags.licensefilelocation === "string")
      licensefilelocation = args.flags.licensefilelocation;
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
  
  // Copy package template
  await copyFolder(path.join(scriptdir, "asset/project-template"), location, async (file, src) => {
    if (src.endsWith(".gitkeep")) return false;
    
    const final = file
      .replace(/VARIABLE_NAME/g, `@${name}/root`)
      .replace(/VARIABLE_DESCRIPTION/g, description)
      .replace(/VARIABLE_PROJECTLICENSE/g, license || "MIT")
      .replace(/VARIABLE_USER/g, process.env.USER ?? "anonymous");

    return final;
  });
}