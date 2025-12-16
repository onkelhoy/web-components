import { getPackageInfo, Terminal } from "@papit/cli-util";
import { readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function getFolders(dir: string): string[] {
  return readdirSync(dir).filter(name => statSync(join(dir, name)).isDirectory());
};

export async function selectFolder(info: ReturnType<typeof getPackageInfo> & {
  scope: string;
}) {

  let target = join(info.root, "packages");
  while (target)
  {

    const session = Terminal.createSession();
    const folders = getFolders(target);

    Terminal.write("Current: ", target.replace(info.root, info.scope));

    const option = await Terminal.option(["Choose Folder", "Create Folder", ...folders]);

    if (option === 0)
    {
      break;
    }
    if (option === 1)
    {
      const name = await Terminal.prompt("Name of the folder?");
      const url = join(target, name);
      const created = await createFolder(url, name);

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


async function createFolder(url: string, name: string) {
  Terminal.write("create folder at location");
  Terminal.write(`[${url}]`);
  Terminal.write();
  const shouldCreate = await Terminal.confirm("answer [y/n]: ");

  if (!shouldCreate) return false;

  Terminal.write();
  const shouldIncludeName = await Terminal.confirm("include folder in package names [y/n]: ");

  let includeMode = "false";
  if (shouldIncludeName)
  {
    includeMode = "true";
    Terminal.write();
    const mode = await Terminal.getAnswer("prefix or suffix?: [p/s]: ", ["prefix", "p", "s", "suffix", ""]);
    if (mode.startsWith("s")) includeMode = "suffix";
    else includeMode = "prefix";
  }

  // its create new mode 
  mkdirSync(url);

  Terminal.write();
  const overrideName = await Terminal.prompt(`override the name (${name})?: `);

  await writeFileSync(join(url, ".config"), `LAYER_FOLDER=${name}\nLAYER_NAME=${overrideName || name}\nLAYER_INCLUDE=${includeMode}`, { flag: "wx" });
  return true;
}