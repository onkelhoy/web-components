import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import fs from "node:fs";
import { Arguments, Terminal } from "@papit/util-cli";
import { InternalServerError } from "../errors";

// Expanded MIME types
const mimeTypes: Record<string, string> = {
  // Text
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.ts': 'text/typescript',
  '.tsx': 'text/typescript',
  '.jsx': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.csv': 'text/csv',
  
  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Images
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  
  // Fonts
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  
  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  
  // Video
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  
  // Archives
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.7z': 'application/x-7z-compressed',
  '.rar': 'application/vnd.rar',
};

const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.bmp', '.tiff', '.tif',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.wav', '.ogg', '.m4a',
  '.mp4', '.webm', '.ogv', '.avi', '.mov',
  '.zip', '.tar', '.gz', '.7z', '.rar',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
]);

// Cache configuration
interface CacheEntry {
  content: Buffer;
  contentType: string;
  mtime: number; // Modified time for cache invalidation
}

const fileCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max cache
const MAX_FILE_SIZE_TO_CACHE = 1024 * 1024; // Only cache files under 1MB
let currentCacheSize = 0;

class CACHE_LIMITS {
  static get MAX_CACHE_SIZE() {
    return this.getValue("MAX_CACHE_SIZE", MAX_CACHE_SIZE);
  }

  static get MAX_FILE_SIZE_TO_CACHE() {
    return this.getValue("MAX_FILE_SIZE_TO_CACHE", MAX_FILE_SIZE_TO_CACHE);
  }

  private static getValue(name:string, fallback: number) {
    const arg = Arguments.args.flags[name];
    if (typeof arg === "string")
    {
      const num = Number(arg);
      if (!Number.isNaN(num)) return num;
    } 

    return fallback;
  }
}

function isCacheable(size: number, ext: string): boolean {
  // Don't cache large files or video files
  if (size > CACHE_LIMITS.MAX_FILE_SIZE_TO_CACHE) return false;
  if (['.mp4', '.webm', '.ogv', '.avi', '.mov'].includes(ext)) return false;
  return true;
}

function evictOldestCache() {
  // Simple LRU: just clear the whole cache when it's full
  // For better performance, implement proper LRU with access timestamps
  if (currentCacheSize > CACHE_LIMITS.MAX_CACHE_SIZE) {
    fileCache.clear();
    currentCacheSize = 0;
  }
}

export function getFile(url: string, relativeURL: string) {
  const stats = fs.statSync(url);
  const ext = path.extname(url).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Check cache first

  let data: CacheEntry|null = null;
  let wasCached = false;
  const cached = fileCache.get(url);
  if (cached && cached.mtime === stats.mtimeMs) {
    
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
      // Add to cache
      evictOldestCache();
      fileCache.set(url, {
        content,
        contentType,
        mtime: stats.mtimeMs,
      });
      if (Arguments.verbose) Terminal.write(`"${relativeURL}"`, Terminal.blue("cached"));
  
      currentCacheSize += content.length;
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

export async function streamFile(
  url: string, 
  relativeURL: string,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
  signal?: AbortSignal,
  send404 = true,
) {
  return new Promise<number>((resolve) => {

    try {
      const { ext, data, wasCached } = getFile(url, relativeURL);
      if (data)
      {
        if (wasCached) {
          
          res.setHeader('Content-Type', data.contentType);
          res.setHeader('Content-Length', data.content.length);
          res.setHeader('X-Cache', 'HIT');
          res.statusCode = 200;
          res.end(data.content);
          return resolve(res.statusCode);
        }
    
        res.setHeader('Content-Type', data.contentType);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Content-Length', data.content.length);
        res.statusCode = 200;
        res.end(data.content);
        return resolve(res.statusCode);
      }
      
      if (Arguments.verbose) Terminal.write(`"${relativeURL}"`, Terminal.yellow("streaming"));

      // Stream large files
      const isBinary = binaryExtensions.has(ext);
      const stream = isBinary 
        ? fs.createReadStream(url, { signal })
        : fs.createReadStream(url, { signal, encoding: "utf-8" });
      
      stream.pipe(res);
      stream.on("error", (err) => {
        if (Arguments.error) Terminal.error("streaming error", path.dirname(url));
        if (Arguments.verbose)
        {
          console.trace(err);
        }
        
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          resolve(res.statusCode);
        }
      });
      stream.on("close", () => {
        if (!res.writableEnded) res.end();

        resolve(res.statusCode);
      });
    } catch (error) {
      if (Arguments.error) Terminal.error("file streaming error", path.dirname(url));
      if (Arguments.verbose)
      {
        console.trace(error);
      }
  
      if (!res.headersSent) {
        res.statusCode = 404;
        if (send404) res.end('File not found');
        resolve(res.statusCode);
      }
    } 
  })
}

// Optional: Clear cache for a specific file (useful for hot reload)
export function invalidateCache(url: string) {
  const cached = fileCache.get(url);
  if (cached) {
    currentCacheSize -= cached.content.length;
    fileCache.delete(url);
  }
}

// Optional: Clear entire cache
export function clearCache() {
  fileCache.clear();
  currentCacheSize = 0;
}