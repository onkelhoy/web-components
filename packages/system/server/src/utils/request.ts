// node imports 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

// external package imports
import { parse, HTMLElement } from "node-html-parser";

// local imports
import { build, watch } from "./esbuild";
import { DEPENDENCY } from "./dependency";
import { route as handleHTML } from "./html";

const ASSET_FOLDERS = (process.env.ASSET_DIRS || "").split(' ');


export function request(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method !== "GET") {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[31mno get request\x1b[0m");
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `only accept get requests: ${req.method}`, code: "no-get" }));
    return;
  }

  if (!req.url) {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[31mno url provided\x1b[0m");
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
    return;
  }
  if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[36mincomming request\x1b[0m", req.url);

  // serve the html
  // this regex will look for hello/ or hello or hello.index
  if (/^(\/([^\/]+\/)*([^\/\.]+|[^\/]+\.html)?)?$/.test(req.url)) {
    handleHTML(req, res);
    return;
  }

  // dealing with asset (info level)
  if (req.url.startsWith("/asset-info")) {
    handleInfo(req, res);
    return;
  }

  // dealing with file-type 
  handleFile(req, res);
}

// route functions 
function handleInfo(req: http.IncomingMessage, res: http.ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("<h1>hello asset</h1>")
}
async function handleFile(req: http.IncomingMessage, res: http.ServerResponse) {
  let file = getFILE(req);

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

      file = getFILE(req);
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
function getBaseUrl(req: http.IncomingMessage) {
  let preurl = "";

  // Ensure referer header is present
  if (req.headers.referer) {
    // Parse the referer URL
    const refererUrl = new URL(req.headers.referer);

    // Get the pathname from the URL (e.g., /server or /server/index.html)
    let pathname = refererUrl.pathname;

    // If the pathname ends with a filename (e.g., index.html), remove it
    if (/\w*\.\w+$/.test(pathname)) {
      pathname = pathname.substring(0, pathname.lastIndexOf('/'));
    }

    preurl = pathname;
  }

  return preurl;
}
function getFILE(req: http.IncomingMessage) {
  const url = req.url as string;
  let fileinfo = null;
  // theme related 

  // REMOVE-BLOCK
  // NOTE this needs some remapping, im keeping some original but the latest (preurl, withoutpreurl) 
  // maybe should be always considered and ONLY considered.. 

  // NOTE i actually comment it out.. lets see if no probelms occur then this could be removed 
  // // get based on .temp folder 
  // fileinfo = trypath(path.join(process.env.LOCATION as string, ".temp", url));
  // if (fileinfo !== null) return fileinfo;
  // REMOVE-BLOCK end 

  // we need to seperate the url from wherever the client is : localhost:3000/server -> server 
  // access file: /style.css should yield -> /server/style.css and not just /style.css
  const preurl = getBaseUrl(req);
  let preurl_withslashend = preurl;
  if (!preurl_withslashend.endsWith('/')) preurl_withslashend += "/";
  let withoutpreurl = url;
  if (url.startsWith(preurl_withslashend)) {
    withoutpreurl = url.split(preurl_withslashend)[1];
  }

  // get based on .temp folder 
  fileinfo = trypath(path.join(process.env.LOCATION as string, ".temp", preurl, withoutpreurl));
  if (fileinfo !== null) return fileinfo;

  // get based on view folder
  fileinfo = trypath(path.join(process.env.LOCATION as string, preurl, withoutpreurl));
  if (fileinfo !== null) return fileinfo;

  for (let local of ["asset", "assets", "public"]) {
    fileinfo = trypath(path.join(process.env.LOCATION as string, preurl, local, withoutpreurl));
    if (fileinfo !== null) return fileinfo;
  }

  // now based on any asset folders 
  for (let folder of ASSET_FOLDERS) {
    fileinfo = trypath(path.join(folder, url));
    if (fileinfo !== null) return fileinfo;
  }

  // get based on dependency folder (asset)
  for (let dep in DEPENDENCY) {
    const info = DEPENDENCY[dep];

    fileinfo = trypath(path.join(info.path, "asset", url));
    if (fileinfo !== null) return fileinfo;
  }

  return null;
}
function trypath(url: string) {
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
  const match = url.match(/\.(.+)$/);
  if (match) {
    const ext = match[1].toLowerCase();
    if (ContentTypeMap[ext]) return ContentTypeMap[ext];
  }

  return "text/plain";
}