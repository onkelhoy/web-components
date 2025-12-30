import path from "node:path";
import fs from "node:fs";
import { Arguments, getDependencyBloodline, getJSON, getPathInfo, LocalPackage, Terminal } from "@papit/util-cli"
import { getAssetFolders, handleAsset, Translation } from "./components/asset";

(async function () {
  const info = getPathInfo(typeof Arguments.args.flags.location === "string" ? Arguments.args.flags.location : undefined);

  const packageJSON = getJSON<LocalPackage>(path.join(info.package, "package.json"));
  if (!packageJSON)
  {
    Terminal.error("location is not a package, missing package.json");
    process.exit(1);
  }

  const translations: Record<string, Translation> = {};
  const assets: Record<string, string[]> = {};
  const { folders: assetFolders, regexp: assetRegexp } = getAssetFolders();

  // NOTE: order is reversed -> last is current package, so looking for asset should always start at the end of array of "assets"
  const { map:ancestors } = await getDependencyBloodline(
    packageJSON.name, 
    async batch => { 
      for (const b of batch) 
      {
        if (!b.location) continue;

        for (const asset of assetFolders)
        {
          const assetLocation = path.join(b.location, asset);
          await handleAsset(b.location, assetLocation, translations, assets, assetRegexp);
        }
      }
    }, 
    { info, type: "ancestors" }
  );
})