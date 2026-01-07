// import statements 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import { Arguments, getPathInfo, LocalPackage, Terminal } from "@papit/cli";
import { executor } from "@papit/build";

// components
import { HttpError } from "../errors";
import { streamFile } from "../file/stream";
import { streamAsset, Translation } from "../asset";
import { getHTML } from "../html";

// local imports 
import { upgrade } from "./socket";
import { getPort } from "./port";

let PORT = Number(Arguments.args.flags.port || 3000);

export let server: null | http.Server = null;

export async function start(
  info: ReturnType<typeof getPathInfo>,
  translations: Record<string, Translation>,
  assets: Record<string, string[]>,
  packageJSON: LocalPackage,
) {
  PORT = await getPort(PORT);
  server = http.createServer();
  
  if (packageJSON.name !== "@papit/server" && !Arguments.args.flags.serve)
  {
    if (Arguments.info) Terminal.write(Terminal.blue("listening to file changes"), packageJSON.name)
    Arguments.args.flags['no-bundle'] = true;
    Arguments.args.flags.live = true;
    Arguments.args.flags.location = info.package;
    Arguments.args.flags.mode = "dev";
    Arguments.args.flags.buildMode = "ancestors";

    executor({
      callback(counter, result) {
        console.log('rebuild')    
      },
    });
  }

  server.listen(PORT, () => {
    Arguments.args.flags.port = String(PORT);
    if (!Arguments.silent) Terminal.write("server:", Terminal.blue(String(PORT)), Terminal.yellow("- running"));
  });

  // events 
  server.on("request", async (req, res) => {
    if (req.method !== "GET")
    {
      if (Arguments.warning) Terminal.warn("dev-server only accepts GET requests");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `only accept GET requests, got: "${req.method}"`, code: "no-get" }));
      return;
    }

    if (!req.url)
    {
      if (Arguments.warning) Terminal.warn("no url provided");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
      return;
    }

    if (req.url === "/favicon.ico")
    {
      return res.end("ok");
    }

    if (req.url === "/.well-known/appspecific/com.chrome.devtools.json")
    {
      return res.end("ok");
    }

    if (Arguments.verbose) Terminal.write(Terminal.blue("incomming request"), req.url);

    let currentURL = path.join(info.local, req.url);
    if (!fs.existsSync(currentURL))
      currentURL = path.join(info.package, req.url);
    if (!fs.existsSync(currentURL))
      currentURL = info.local;
    if (!fs.existsSync(currentURL))
      currentURL = info.package;

    const status = fs.statSync(currentURL);
    if (status.isFile())
    {
      const status = await streamFile(currentURL, req.url, res);
      if (status !== 404) return;
    }

    try
    {
      const result = await streamAsset(translations, assets, req, res);
      if (result) 
      {
        if (!res.headersSent) res.end();
        return
      }
    }
    catch (e) 
    {
      if (e instanceof HttpError)
      {
        res.statusCode = e.status;
        res.write(e.message);
        res.end();
        return;
      }
    }

    const dom = await getHTML(info, assets, packageJSON, currentURL);

    res.statusCode = 200;
    res.end(dom.outerHTML);
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