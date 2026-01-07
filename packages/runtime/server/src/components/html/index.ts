import path from "node:path";
import fs from "node:fs";
import { Arguments, getPathInfo, LocalPackage } from "@papit/util";

import { createExplorer } from "./explorer";
import { createInline } from "./inline";

export async function getHTML(
  info: ReturnType<typeof getPathInfo>,
  assets: Record<string, string[]>,
  packageJSON: LocalPackage,
  url: string,
) {

  let htmlSource = path.join(url, "index.html");
  if (typeof Arguments.args.flags.view === "string")
  {
    const view = Arguments.args.flags.view.endsWith(".html") ? Arguments.args.flags.view : path.join(Arguments.args.flags.view, "index.html");
    if (fs.existsSync(view))
    {
      htmlSource = view;
    }
  }
  else if (packageJSON.papit?.main)
  {
    const view = path.join(info.package, "views", packageJSON.papit.main, "index.html");
    if (fs.existsSync(view))
    {
      htmlSource = view;
    }
  }

  if (fs.existsSync(htmlSource))
  {
    return createInline(htmlSource, info);
  }

  const FFs = fs.readdirSync(url);
  return createExplorer(assets, info, packageJSON, FFs, url);
}