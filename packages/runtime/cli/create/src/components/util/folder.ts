import { getArguments, Terminal, RootPackage, getPathInfo } from "@papit/util-cli";
import fs from "node:fs";
import { join } from "node:path";
import { stripRootPath } from "./helper";

export function getFolders(dir: string): string[] {
  return fs.readdirSync(dir).filter(name => fs.statSync(join(dir, name)).isDirectory());
};

function getLayerFolders(
  dir: string, 
  rootPackage: RootPackage, 
  info: ReturnType<typeof getPathInfo>
): string[] {
  return fs.readdirSync(dir).filter(name => {
    const joined = join(dir, name);
    if (!fs.statSync(joined).isDirectory()) return false;
    const replaced = stripRootPath(info.root, joined);
    
    return !!rootPackage.papit.layers[replaced]
  });
};

export async function selectFolder(
  info: ReturnType<typeof getPathInfo> & { scope: string;}, 
  args: ReturnType<typeof getArguments>,
  rootPackage: RootPackage,
) {
  return Terminal.sessionBlock(async () => {    
    let target = join(info.root, "packages");
  
    while (target)
    {
      const session = Terminal.createSession();
      const folders = getLayerFolders(target, rootPackage, info);
  
      Terminal.write("Current: ", target.replace(info.root, info.scope));
      Terminal.write();
  
      const option = await Terminal.option(["Choose Folder", "Create Folder", ...folders]);
  
      if (option === 0)
      {
        break;
      }
      if (option === 1)
      {
        const name = await Terminal.prompt("Name of the folder?");
        const url = join(target, name);
        const created = await createFolder(url, name, args, info, rootPackage);
  
        if (created)
        {
          target = join(target, name);
        }
      }
      else 
      {
        target = join(target, folders[option - 2]);
      }
      Terminal.clearSession(session);
    }
  
    return target;
  });
}


async function createFolder(
  url: string, 
  name: string, 
  args: ReturnType<typeof getArguments>,
  info: ReturnType<typeof getPathInfo>,
  rootPackage: RootPackage,
) {
  Terminal.write(`[${url}]`);
  Terminal.write();
  Terminal.createSession();
  const shouldCreate = args.flags.agree || await Terminal.confirm("confirm folder creation", true);
  Terminal.clearSession();

  if (!shouldCreate) return false;

  // its create new mode 
  fs.mkdirSync(url);

  await createFolderConfig(url, name, info, rootPackage);

  return true;
}

export async function createFolderConfig(
  url: string, 
  name: string,
  info: ReturnType<typeof getPathInfo>,
  rootPackage: RootPackage,
) {
  return Terminal.sessionBlock(async () => {
    const overrideName = await Terminal.prompt(`use "${name}" or override?`);
    Terminal.clearSession();
  
    const prefixSuffix = ["false", "prefix", "suffix"];
    const ps_index = await Terminal.option(prefixSuffix, `include "${overrideName}" in packages`);
    const includeMode = prefixSuffix[ps_index];
  
    if (!rootPackage.papit) rootPackage.papit = { layers: {} };
    const localFolder = stripRootPath(info.root, url);
    rootPackage.papit.layers[localFolder] = {
      include: includeMode === "false" ? false : includeMode as "prefix"|"suffix",
      name,
    }

    fs.writeFileSync(join(info.root, "package.json"), JSON.stringify(rootPackage, null, 2), { encoding: "utf-8" });
  });
}