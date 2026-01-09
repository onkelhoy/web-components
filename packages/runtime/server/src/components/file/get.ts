import fs from "node:fs";
import path from "node:path";
import { Arguments } from "@papit/util";
import { ServerResponse } from "node:http";

import { getURL } from "../http/url";
import { FileConstants } from "./types";
import { Cache } from "./cache";
import { streamFile } from "./stream";
import { NotFoundError } from "../errors";

export function getFILE(
  url: ReturnType<typeof getURL>, 
  cache: Cache,
  res: ServerResponse,
  signal?: AbortSignal,
)
{
  if (!fs.existsSync(url.absolute)) throw new NotFoundError(`${url.relative} not found`);
  
  // at this point we assume the url is not in the cache 
  const extname = path.extname(url.absolute);
  const stats = fs.statSync(url.absolute);
  if (!cache.isCacheable(stats.size, extname)) 
  {
    console.log('streamed', stats.size)
    streamFile(url.absolute, res, signal)
    return "streamed";
  }

  const mimeType = FileConstants.MimeTypes[extname] ?? "text/plain";
  const buffer = fs.readFileSync(url.absolute);
  const entry = { mimeType, buffer, mtime: stats.mtimeMs };

  if (!Arguments.args.flags['no-cache']) 
  {
    return entry;
  }

  cache.add(url, buffer, mimeType, entry.mtime);
  return entry;
}

// export function getFile(url: string, requestURL: string|undefined, force = false) {
//   const stats = fs.statSync(url);
//   const ext = path.extname(url).toLowerCase();
//   const contentType = FileConstants.MimeTypes[ext] || 'application/octet-stream';

//   // Check cache first

//   let data: CacheEntry | null = null;
//   let wasCached = false;
//   const cached = FileConstants.fileCache.get(url);
//   if (cached && cached.mtime === stats.mtimeMs)
//   {

//     if (Arguments.verbose) Terminal.write(`"${requestURL}"`, Terminal.green("cache hit"));
//     data = cached;
//     wasCached = true;
//   }
//   else if (isCacheable(stats.size, ext) || force)
//   {
//     // If file is cacheable, read into memory
//     const content = fs.readFileSync(url);

//     if (!Arguments.args.flags['no-cache'])
//     {
//       evictOldestCache();
//       // Add to cache
//       FileConstants.fileCache.set(url, {
//         content,
//         contentType,
//         mtime: stats.mtimeMs,
//       });
//       if (Arguments.verbose) Terminal.write(`"${requestURL}"`, Terminal.blue("cached"));

//       FileConstants.currentCacheSize += content.length;
//     }

//     data = {
//       content,
//       contentType,
//       mtime: stats.mtimeMs,
//     }
//   }

//   return {
//     data,
//     ext,
//     cached,
//     wasCached,
//   };
// }