import path from "node:path";

import {
  Terminal,
  getPackageInfo,
  getConfig,
  getArguments,
} from "@papit/cli-util"
import { getFolders } from "components/util";

export async function runner(scriptdir: string, args: ReturnType<typeof getArguments>, packageLocation?: string) {

  const info = getPackageInfo(packageLocation);
  const config = getConfig(path.join(info.local, ".config"));

  if (config == null)
  {
    Terminal.error("could not find package's .config file");
    process.exit();
  }

  const templates = getFolders(path.join(scriptdir, "asset/component-templates"));
  let templateIndex = templates.findIndex(f => f === config.TEMPLATE_TYPE);

  if (templateIndex < 0)
  {
    const argType = args.flags.component ?? args.flags.type;
    templateIndex = templates.findIndex(f => f === argType);

    if (templateIndex < 0)
    {
      Terminal.write("type of component");
      templateIndex = await Terminal.option(templates);
    }
  }

  const folders = getFolders(path.join(scriptdir, "asset/component-templates", templates[templateIndex]))
  for (const folder of folders)
  {
    console.log(folder);
  }
}