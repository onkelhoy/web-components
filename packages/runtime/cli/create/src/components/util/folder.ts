import { getArguments, getConfig, getPackageInfo, Terminal } from "@papit/cli-util";
import { readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function getFolders(dir: string): string[] {
  return readdirSync(dir).filter(name => statSync(join(dir, name)).isDirectory());
};

function getLayerFolders(dir: string): string[] {
  return readdirSync(dir).filter(name => {
    const joined = join(dir, name);
    if (!statSync(joined).isDirectory()) return false;

    const config = getConfig(join(joined, ".config"));
    if (config == null) return true; // risky but we want to have "pure" folders

    return config.IS_LAYER || config.LAYER_INCLUDE;
  });
};

export async function selectFolder(info: ReturnType<typeof getPackageInfo> & {
  scope: string;
}, args: ReturnType<typeof getArguments>) {

  let target = join(info.root, "packages");
  while (target)
  {

    const session = Terminal.createSession();
    const folders = getLayerFolders(target);

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
      const created = await createFolder(url, name, args);

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
}


async function createFolder(url: string, name: string, args: ReturnType<typeof getArguments>) {
  Terminal.write(`[${url}]`);
  Terminal.write();
  const shouldCreate = args.flags.agree || await Terminal.confirm("confirm folder creation");

  if (!shouldCreate) return false;

  Terminal.write();

  const prefixSuffix = ["false", "prefix", "suffix"];
  const ps_index = await Terminal.option(prefixSuffix, "include folder in package names?");

  const includeMode = prefixSuffix[ps_index];

  // its create new mode 
  mkdirSync(url);

  Terminal.write();
  const overrideName = await Terminal.prompt(`override the name (${name})?: `);

  await writeFileSync(join(url, ".config"), `IS_LAYER=true\nLAYER_FOLDER=${name}\nLAYER_NAME=${overrideName || name}\nLAYER_INCLUDE=${includeMode}`, { flag: "wx" });
  return true;
}