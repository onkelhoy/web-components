import path from "node:path";

import {
  Terminal,
  getPackageInfo,
  getConfig,
} from "@papit/cli-util"
import { getFolders } from "components/util";

export async function runner(scriptdir: string) {

  const info = getPackageInfo();
  const config = getConfig(path.join(info.local, ".config"));

  if (config == null)
  {
    Terminal.error("could not find package .config file");
    process.exit();
  }

  const templates = getFolders(path.join(scriptdir, "asset/component-templates"));
  let templateIndex = templates.findIndex(f => f === config.TEMPLATE_TYPE);

  if (templateIndex < 0)
  {
    templateIndex = await Terminal.option(templates);
  }

  console.log('congratulations you made a choice', templates[templateIndex]);
}