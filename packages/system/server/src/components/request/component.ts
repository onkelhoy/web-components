// node imports 
import http from "node:http";

// local imports
import { route as handleHTML } from "../html";
import { route as handleFile } from "../file";
import { route as handleAsset } from "../asset";
import { route as handleTheme } from "../theme";

export function request(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method !== "GET") {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("no get request");
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `only accept get requests: ${req.method}`, code: "no-get" }));
    return;
  }

  if (!req.url) {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("no url provided");
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
    return;
  }
  if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[36mincomming request", req.url);

  // dealing with asset (info level)
  if (req.url.startsWith("/asset/")) {
    handleAsset(req, res);
    return;
  }

  // serve the html
  // this regex will look for hello/ or hello or hello.index
  if (/^(\/([^\/]+\/)*([^\/\.]+|[^\/]+\.html)?)?$/.test(req.url)) {
    handleHTML(req, res);
    return;
  }

  if (handleTheme(req, res)) return;

  // dealing with file-type 
  handleFile(req, res);
}