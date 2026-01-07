import fs from "node:fs";
import path from "node:path";
import { CacheEntry, FileConstants } from "./types";
import { Arguments, Terminal } from "@papit/cli";

function isCacheable(size: number, ext: string): boolean {
  // Don't cache large files or video files
  if (size > FileConstants.MAX_FILE_SIZE_TO_CACHE) return false;
  if (['.mp4', '.webm', '.ogv', '.avi', '.mov'].includes(ext)) return false;
  return true;
}

function evictOldestCache() {
  // Simple LRU: just clear the whole cache when it's full
  // For better performance, implement proper LRU with access timestamps
  if (FileConstants.currentCacheSize > FileConstants.MAX_CACHE_SIZE)
  {
    FileConstants.fileCache.clear();
    FileConstants.currentCacheSize = 0;
  }
}

export function getFile(url: string, relativeURL: string) {
  const stats = fs.statSync(url);
  const ext = path.extname(url).toLowerCase();
  const contentType = FileConstants.MimeTypes[ext] || 'application/octet-stream';

  // Check cache first

  let data: CacheEntry | null = null;
  let wasCached = false;
  const cached = FileConstants.fileCache.get(url);
  if (cached && cached.mtime === stats.mtimeMs)
  {

    if (Arguments.verbose) Terminal.write(`"${relativeURL}"`, Terminal.green("cache hit"));
    data = cached;
    wasCached = true;
  }
  else if (isCacheable(stats.size, ext))
  {
    // If file is cacheable, read into memory
    const content = fs.readFileSync(url);

    if (!Arguments.args.flags['no-cache'])
    {
      evictOldestCache();
      // Add to cache
      FileConstants.fileCache.set(url, {
        content,
        contentType,
        mtime: stats.mtimeMs,
      });
      if (Arguments.verbose) Terminal.write(`"${relativeURL}"`, Terminal.blue("cached"));

      FileConstants.currentCacheSize += content.length;
    }

    data = {
      content,
      contentType,
      mtime: stats.mtimeMs,
    }
  }

  return {
    data,
    ext,
    cached,
    wasCached,
  };
}