import path from "node:path";
import fs from "node:fs";
import { Arguments, getJSON, getPathInfo, Terminal } from "@papit/util-cli";

import { Translation, Translations } from "./types";
import { deepMerge } from "./util";
import { NotFoundError } from "../errors";

async function extractTranslation(folder: string, translations: Translations) {
  const files = fs.readdirSync(folder).filter(name => fs.statSync(path.join(folder, name)).isFile() && name.endsWith(".json"));

  for (const file of files)
  {
    const json = getJSON<Translation>(file);
    if (!json) continue;

    if (!translations[json.meta.language]) translations[json.meta.language] = { meta: json.meta };
    translations[json.meta.language] = deepMerge(translations[json.meta.language], json, ["meta"]);
  }
}

export function getAssetFolders() {
  const folders = ["asset", "assets", "public"];
  if (Arguments.args.flags.asset)
  {
    if (typeof Arguments.args.flags.asset === "string") folders.push(Arguments.args.flags.asset);
    else if (Array.isArray(Arguments.args.flags.asset)) folders.push(...Arguments.args.flags.asset);
  }
  const regexp = new RegExp(`[${folders.join("|")}]`);

  return {
    folders,
    regexp,
  }
}

export async function handleAsset(
  root: string, 
  location: string, 
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
  assetRegexp: RegExp, // /[assets?|public|files?]/
  deep = 0,
) {
  if (!fs.existsSync(location)) return;

  // files and folders
  const FFs = fs.readdirSync(location); // .filter(name => fs.statSync(path.join(location, name)).isDirectory());

  for (const name of FFs) 
  {
    const lowerName = name.toLowerCase();
    const url = path.join(location, lowerName);
    const relativeUrl = url.replace(root, "").replace(assetRegexp, "");
    const stat = fs.statSync(url);
    const isDirectory = stat.isDirectory();
    if (!(stat.isFile() || isDirectory)) return;

    if (!assets[relativeUrl]) assets[relativeUrl] = [];
    assets[relativeUrl].push(url);
    
    if (isDirectory)
    {
      if (lowerName.startsWith("translation"))
      {
        await extractTranslation(url, translations);
        return;
      }

      if (deep < 10)
      {
        await handleAsset(root, url, translations, assets, assetRegexp, deep + 1);
      }
      else if (Arguments.warning)
      {
        Terminal.warn("max asset depth reached", url);
      }
    }
  }
}


const cachedFiles:Record<string,string> = {}
function getAsset(
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
  url: string,
) {
  if (cachedFiles[url]) return cachedFiles[url];

  if (Arguments.debug) console.log('requesting', url)
    
  if (assets[url])
  {
    const files = [...assets[url]];
    while (files.length > 0)
    {
      const filelocation = files.pop()!;
      try {
        const data = fs.readFileSync(filelocation, {encoding: "utf-8"});
        if (!Arguments.args.flags['no-cache']) cachedFiles[url] = data;
        return data;
      }
      catch (e)
      {
        if (Arguments.warning)
        {
          Terminal.warn(`"${filelocation}" not found`);
        }
        if (Arguments.debug)
        {
          console.trace(e);
        }
      }
    }
  }

  // we need to check translations 
  // if (translations[url])

  throw new NotFoundError(`asset "${url}" not found`);
}