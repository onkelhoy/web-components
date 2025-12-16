import { getPackageInfo, Renderer } from "@papit/cli-util";
import { readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function getFolders(dir: string): string[] {
  return readdirSync(dir).filter(name => statSync(join(dir, name)).isDirectory());
};

export async function selectFolder(url?: string) {
  const info = getPackageInfo();

  let target = join(info.root, "packages");
  while (target)
  {

    const session = Renderer.createSession();
    const folders = getFolders(target);
    let selected = "";
    Renderer.write("Current: ", target);
    folders.forEach((name, index) => Renderer.write(`[${index}]: ${name}`));
    Renderer.write();
    
    await Renderer.getAnswer("Select folder or create a new", async ans => {
      const num = Number(ans);

      if (!Number.isNaN(num))
      {
        if (num >= 0 && num < folders.length)
        {
          selected = folders[num];
          return true;
        }

        return false;
      }

      const found = folders.find(f => f === ans);
      if (found) 
      {
        selected = found;
        return true;
      }


      const url = join(info.root, ...selected, ans);
      const created = await createFolder(url, ans);
      if (created)
      {
        selected = ans;
        return true;
      }

      return false;
    });

    target = join(target, selected);
    Renderer.clearSession(session);
  }
}


async function createFolder(url: string, name: string) {
  Renderer.write("create folder at location");
  Renderer.write(`[${url}]`);
  Renderer.write();
  const shouldCreate = await Renderer.confirm("answer [y/n]: ");

  if (!shouldCreate) return false;

  Renderer.write();
  const shouldIncludeName = await Renderer.confirm("include folder in package names [y/n]: ");

  let includeMode = "false";
  if (shouldIncludeName)
  {
    includeMode = "true";
    Renderer.write();
    const mode = await Renderer.getAnswer("prefix or suffix?: [p/s]: ", ["prefix", "p", "s", "suffix", ""]);
    if (mode.startsWith("s")) includeMode = "suffix";
    else includeMode = "prefix";
  }

  // its create new mode 
  mkdirSync(url);

  Renderer.write();
  const overrideName = await Renderer.prompt(`override the name (${name})?: `);

  await writeFileSync(join(url, ".config"), `LAYER_FOLDER=${name}\nLAYER_NAME=${overrideName || name}\nLAYER_INCLUDE=${includeMode}`, { flag: "wx" });
  return true;
}