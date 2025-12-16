import { getAnswer, getBooleanAnswer, getPackageInfo, prompt } from "@papit/util-cli";
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
    const folders = getFolders(target);
    let selected = "";
    folders.forEach((name, index) => console.log(`[${index}]: ${name}`));
    await getAnswer("Select folder or create a new", async ans => {
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
  }
}


async function createFolder(url: string, name: string) {
  console.log("create folder at location");
  console.log(`[${url}]`);
  console.log();
  const shouldCreate = await getBooleanAnswer("answer [y/n]: ");

  if (!shouldCreate) return false;

  console.log();
  const shouldIncludeName = await getBooleanAnswer("include folder in package names [y/n]: ");

  let includeMode = "false";
  if (shouldIncludeName)
  {
    includeMode = "true";
    console.log();
    const mode = await getAnswer("prefix or suffix?: [p/s]: ", ["prefix", "p", "s", "suffix", ""]);
    if (mode.startsWith("s")) includeMode = "suffix";
    else includeMode = "prefix";
  }

  // its create new mode 
  mkdirSync(url);

  console.log();
  const overrideName = await prompt(`override the name (${name})?: `);

  await writeFileSync(join(url, ".config"), `LAYER_FOLDER=${name}\nLAYER_NAME=${overrideName || name}\nLAYER_INCLUDE=${includeMode}`, { flag: "wx" });
  return true;
}