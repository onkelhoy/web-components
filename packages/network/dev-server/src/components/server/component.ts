// import statements 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import { Arguments, getPathInfo, Terminal } from "@papit/util-cli";
import { Document } from "@papit/html";

// local imports 
import { upgrade } from "../socket";
// import { request as handlerequest } from "../request";
import { Translation } from "../asset";
import { getPort } from "./port";

let PORT = Number(Arguments.args.flags.port || 3000);

export let server: null | http.Server = null;

export async function start(
  info: ReturnType<typeof getPathInfo>,
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
) {
  PORT = await getPort(PORT);
  server = http.createServer();

  server.listen(PORT, () => {
    Arguments.args.flags.port = String(PORT);
    if (Arguments.info)
    {
      Terminal.write(Terminal.yellow("root") + ":", info.root);
      Terminal.write(Terminal.yellow("package") + ":", info.package);
      Terminal.write(Terminal.yellow("location") + ":", info.local);
      Terminal.write();
    }
    if (!Arguments.silent) Terminal.write("server:", Terminal.blue(String(PORT)), Terminal.yellow("- running"));
  });

  // events 
  server.on("request", async (req, res) => {
    if (req.method !== "GET") {
      if (Arguments.warning) Terminal.warn("dev-server only accepts GET requests");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `only accept GET requests, got: "${req.method}"`, code: "no-get" }));
      return;
    }


    if (!req.url) {
      if (Arguments.warning) Terminal.warn("no url provided");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
      return;
    }

    if (Arguments.verbose) Terminal.write(Terminal.yellow("incomming request"), req.url);

    // this regex will look for "hello/" or "hello" or "hello.html"
    // if (/^(\/([^\/]+\/)*([^\/\.]+|[^\/]+\.html)?)?$/.test(req.url)) 
    // {
    //   // handleHTML(req, res);
    //   return;
    // }

    const doc = new Document();
    doc.innerHTML = `
      <html>
        <body>
          <h1>HELLO FUCKING WORLD</h1>
        </body>
      </html>
    `;

    res.end(doc.outerHTML);

  });

  server.on('error', (error: Error) => {
    if (Arguments.error)
    {
      Terminal.error(error.name, error.message, error.stack ?? "");
    }
  });

  // socket related
  server.on('upgrade', upgrade);
}

export function close() {
  server?.close();
  if (!Arguments.silent) Terminal.write("server:", Terminal.blue(String(PORT)), Terminal.yellow("- shutdown"));
}