import path from "node:path";
import fs from "node:fs";
import { getPathInfo, LocalPackage } from "@papit/cli";

import { createExplorer } from "./explorer";
import { createInline } from "./inline";

export async function getHTML(
  info: ReturnType<typeof getPathInfo>,
  assets: Record<string, string[]>,
  packageJSON: LocalPackage,
  url: string,
) {

  const indexhtml_path = path.join(url, "index.html");
  if (fs.existsSync(indexhtml_path))
  {
    return createInline(indexhtml_path, info);
  }

  const FFs = fs.readdirSync(url);
  return createExplorer(assets, info, packageJSON, FFs, url);
}