import path from "node:path";
import fs from "node:fs";
import { Arguments, getJSON, getPathInfo, Terminal } from "@papit/util-cli";

import { Translation, Translations } from "./types";
import { deepMerge } from "./util";
import { NotFoundError } from "../errors";
import { IncomingMessage, ServerResponse } from "node:http";
import { streamFile } from "./stream-file";

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
  return folders;
}

export async function handleAsset(
  root: string, 
  location: string, 
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
  folders: string[], // [assets|public|files]
  deep = 0,
) {
  if (!fs.existsSync(location)) return;

  // files and folders
  const FFs = fs.readdirSync(location); // .filter(name => fs.statSync(path.join(location, name)).isDirectory());

  for (const name of FFs) 
  {
    const url = path.join(location, name);
    const stat = fs.statSync(url);
    const isDirectory = stat.isDirectory();
    if (!(stat.isFile() || isDirectory)) return;


    const relativeURL = path.relative(root, url);
    
    const absoluteURL = '/' + relativeURL;
    if (!assets[absoluteURL]) assets[absoluteURL] = [];
    assets[absoluteURL].push(url);

    const segments = relativeURL.split(path.sep);
    // Remove first segment if it's an asset folder
    if (folders.includes(segments[0])) {
      segments.shift();
      const relativeURL = '/' + segments.join('/');

      if (!assets[relativeURL]) assets[relativeURL] = [];
      assets[relativeURL].push(url);
    }
    
    if (isDirectory)
    {
      const lowerName = name.toLowerCase();
      if (lowerName.startsWith("translation"))
      {
        await extractTranslation(url, translations);
        return;
      }

      if (deep < 10)
      {
        await handleAsset(root, url, translations, assets, folders, deep + 1);
      }
      else if (Arguments.warning)
      {
        Terminal.warn("max asset depth reached", url);
      }
    }
  }
}


export async function sendAsset(
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
  signal?: AbortSignal,
) {
  const url = req.url;

  if (!url) return null;
  if (path.extname(url) === "") return null;

  if (Arguments.debug) console.log('requesting', url)

  if (assets[url]) 
  {
    const files = [...assets[url]];
    while (files.length > 0)
    {
      const filelocation = files.pop()!;
      const status = await streamFile(filelocation, req.url ?? url, res, signal);

      if (status === 200)
      {
        return true;
      }
    }
  }

  // we need to check translations 
  // if (translations[url])

  throw new NotFoundError(`asset "${url}" not found`);
}