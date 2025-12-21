// node imports 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

// local imports
import { build, watch } from "../esbuild";
import { DEPENDENCY } from "../dependency";
import { get as assetget } from "../asset";
import { get as languageget } from "../language";
import { FileType } from "./types";

const ASSET_FOLDERS = (process.env.ASSET_DIRS || "").split(' ');

export async function route(req: http.IncomingMessage, res: http.ServerResponse) {
  let file = get(req);

  if (file === null) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ "error": `file not found: "${req.url}"` }));
  }
  else {
    res.statusCode = 200;
    res.setHeader("Content-Type", getContentType(file.url));

    if (file.url.endsWith(".js") && !file.url.includes('.temp')) {
      if (process.env.LIVE) {
        await watch(file.url);
      }
      else {
        await build(file.url);
      }

      file = get(req);
      if (file === null) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ "error": `esbuild went wrong: "${req.url}"` }));
        return;
      }
    }

    res.end(file.data);
  }
}


// helper functions 
function get(req: http.IncomingMessage) {
  const url = req.url as string;

  let fileinfo = null;
  const { base, file, folder } = getURL(req);

  if (file.endsWith(".js")) {
    // get based on .temp folder 
    fileinfo = trypath(path.join(process.env.LOCATION as string, ".temp", base, folder, file));
    if (fileinfo !== null) return fileinfo;
  }

  if (url.startsWith("/translation")) {
    const language = languageget(path.basename(url, path.extname(url)))
    if (language) {
      return {
        data: JSON.stringify(language),
        url,
      }
    }
  }

  // check if pre calculated assets can give it (should be 100% of all asset cases)
  const assetinfo = assetget(url);
  if (assetinfo) {
    if (typeof assetinfo === "string") {
      fileinfo = trypath(assetinfo);
      if (fileinfo !== null) return fileinfo;
    }
    else {
      return assetinfo;
    }
  }

  // get based on view folder
  fileinfo = trypath(path.join(process.env.LOCATION as string, base, folder, file));
  if (fileinfo !== null) return fileinfo;

  for (let local of ["asset", "assets", "public"]) {
    fileinfo = trypath(path.join(process.env.LOCATION as string, base, local, folder, file));
    if (fileinfo !== null) return fileinfo;
  }

  // now based on any asset folders 
  for (let folder of ASSET_FOLDERS) {
    fileinfo = trypath(path.join(folder, folder, file));
    if (fileinfo !== null) return fileinfo;
  }

  // get based on dependency folder (asset)
  for (let dep in DEPENDENCY) {
    const info = DEPENDENCY[dep];

    fileinfo = trypath(path.join(info.path, "asset", folder, file));
    if (fileinfo !== null) return fileinfo;
  }

  return null;
}
function getURL(req: http.IncomingMessage) {
  let url = "";
  let base = "";

  if (req.url) url = req.url;
  if (req.headers.referer) base = new URL(req.headers.referer).pathname;

  // clearing up base from any file pointers 
  const lastslash_base = base.lastIndexOf("/");
  if (base.slice(lastslash_base, base.length).includes(".")) {
    base = base.slice(0, lastslash_base);
  }

  const urllastslash = url.lastIndexOf("/");
  let file = url.substring(urllastslash + 1, url.length);
  url = url.substring(0, urllastslash);
  let folder = "";

  // remove the last slash of base & url 
  if (base.endsWith("/")) base = base.substring(0, base.lastIndexOf("/"));

  // last step to figure out where to draw the folder from 
  if (base.startsWith(url)) {
    // this means url = base, so we take the last + remove it from base
    const split = base.split("/");
    folder = split[split.length - 1];
    base = base.substring(0, base.lastIndexOf(folder));
  }
  else {
    /// this means url and base not the same so we take from url 
    /// it could still mean base and url have some part in common 
    /// so we are interessted in the part thats not in common 
    const urlsplit = url.split("/");
    const basesplit = base.split("/");
    for (let i = 0; i < urlsplit.length; i++) {
      if (urlsplit[i] === basesplit[i]) continue;

      // we found the case 
      folder = urlsplit.slice(i, urlsplit.length).join("/");
      break;
    }
  }

  return { base, file, folder };
}
function trypath(url: string): FileType | null {
  try {
    const data = fs.readFileSync(url);
    return { data, url };
  }
  catch {
    return null;
  }
}
const ContentTypeMap: Record<string, string> = {
  "js": "text/javascript",
  "css": "text/css",
  "csv": "text/csv",
  "pdf": "application/pdf",
  "json": "application/json",
  "png": "image/png",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "gif": "image/gif",
  "svg": "image/svg+xml",
  "mpeg": "video/mpeg", // audio?
  "mp4": "video/mp4",
  "quicktime": "video/quicktime",
  "webm": "video/webm",
}
function getContentType(url: string) {
  const match = url.match(/\.([^temp]+)$/);
  if (match) {
    const ext = match[1].toLowerCase();
    if (ContentTypeMap[ext]) return ContentTypeMap[ext];
  }

  return "text/plain";
}