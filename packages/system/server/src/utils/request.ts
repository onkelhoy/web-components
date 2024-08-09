// node imports 
import http from "node:http";

// local imports
import { route as handleHTML } from "./html";
import { route as handleFile } from "./file";

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