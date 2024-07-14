// node imports 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// external package imports
import { parse, HTMLElement } from "node-html-parser";

// local imports
import { build, watch } from "./esbuild";
import { DEPENDENCY } from "./dependency";
// import { URL } from "node:url";

const templateHTML: Record<"common" | "live", null | HTMLElement> = {
  common: null,
  live: null,
}

export function request(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method !== "GET") {
    if (process.env.VERBOSE === "true") console.log("\x1b[31mno get request\x1b[0m");
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `only accept get requests: ${req.method}`, code: "no-get" }));
    return;
  }

  if (!req.url) {
    if (process.env.VERBOSE === "true") console.log("\x1b[31mno url provided\x1b[0m");
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
    return;
  }
  if (process.env.VERBOSE === "true") console.log("\x1b[36mincomming request\x1b[0m", req.url);

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
function handleHTML(req: http.IncomingMessage, res: http.ServerResponse) {
  let filepath = req.url as string;
  if (!filepath.endsWith(".html")) {
    filepath = "index.html";
  }
  try {
    let file = fs.readFileSync(path.join(process.env.VIEWDIR as string, filepath), 'utf-8');
    const document = parse(file);
    if (document) {
      if (process.env.LIVE) {
        document.querySelector('head')?.appendChild(getHTML("live"));
      }
      document.querySelector('head')?.appendChild(getHTML("common"));
      file = document.toString();
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(file)
  }
  catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(error));
  }
}
function handleInfo(req: http.IncomingMessage, res: http.ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("<h1>hello asset</h1>")
}
async function handleFile(req: http.IncomingMessage, res: http.ServerResponse) {
  let file = getFILE(req.url as string);

  if (file === null) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ "error": `file not found: "${req.url}"` }));
  }
  else {
    res.statusCode = 200;
    res.setHeader("Content-Type", getContentType(file.url));

    if (file.url.endsWith(".js") || !file.url.includes('.temp')) {
      if (process.env.LIVE) {
        await watch(file.url);
      }
      else {
        await build(file.url);
      }

      file = getFILE(req.url as string);
      if (file === null) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ "error": `esbuild went wrong: "${req.url}"` }));
        return;
      }

      res.setHeader("Content-Type", "text/javascript");
    }

    res.end(file.data);
  }
}

// helper functions 
function getHTML(type: "common" | "live"): HTMLElement {
  if (templateHTML[type] === null) {
    let file = fs.readFileSync(path.join(process.env.SCRIPTDIR as string, `template/${type}.html`), 'utf-8');
    if (type === "live") {
      file = file.replace('PORT', process.env.PORT as string);
    }
    templateHTML[type] = parse(file);
  }

  return templateHTML[type];
}
function getFILE(url: string) {
  let fileinfo = null;

  // theme related 

  // get based on .temp folder 
  fileinfo = trypath(path.join(process.env.VIEWDIR as string, ".temp", url));
  if (fileinfo !== null) return fileinfo;

  // get based on view folder 
  fileinfo = trypath(path.join(process.env.VIEWDIR as string, url));
  if (fileinfo !== null) return fileinfo;

  // get based on view folder (public/asset)
  fileinfo = trypath(path.join(process.env.VIEWDIR as string, "public", url));
  if (fileinfo !== null) return fileinfo;

  fileinfo = trypath(path.join(process.env.VIEWDIR as string, "asset", url));
  if (fileinfo !== null) return fileinfo;

  // get based on package folder (asset)
  fileinfo = trypath(path.join(process.env.PACKAGEDIR as string, "asset", url));
  if (fileinfo !== null) return fileinfo;

  // get based on global folder (asset)
  fileinfo = trypath(path.join(process.env.ROOTDIR as string, "asset", url));
  if (fileinfo !== null) return fileinfo;

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