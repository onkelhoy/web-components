// node imports 
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

// local imports
import { THEME } from "./types";
import { fileinfo } from "../asset";

export const THEMES: Record<string, THEME> = {};

export function init(LOCKFILE: any) {
  // check for any themes in LOCKFILE
  for (let packageurl in LOCKFILE.packages) {
    const match = packageurl.match(/node_modules\/[^\/]+\/theme-(\w+)/);
    if (match) {
      const [_full, name] = match;
      const fullpath = path.join(process.env.ROOTDIR as string, packageurl, "lib", "style.css");
      const info = fileinfo(fullpath);
      if (info === "file") {
        if (!THEMES[name]) THEMES[name] = { sources: [], generated: undefined };
        THEMES[name].sources.push(fullpath);
      }
    }
  }
}

export function route(req: http.IncomingMessage, res: http.ServerResponse) {
  const match = (req.url as string).match(/^\/?themes?\/([^\.]+)/);
  if (match) {
    let [_full, name] = match;
    if (!THEMES[name]) {
      if (process.env.LOGLEVEL !== "none") {
        console.log(`[server error] can not find theme: ${name}`);
      }
      name = "core"; // fallback case
    }

    if (!THEMES[name]) {
      if (process.env.LOGLEVEL !== "none") console.log(`[server error] can not find theme: ${name}`);
      res.statusCode = 404;
      res.end('/*not found*/');
    }
    else {
      if (!THEMES[name].generated) {
        THEMES[name].generated = "";
        for (let source of THEMES[name].sources) {
          THEMES[name].generated += fs.readFileSync(source, "utf-8");
        }
      }

      res.end(THEMES[name].generated);
    }
    return true;
  }
}