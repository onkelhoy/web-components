// import statements 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { Arguments, getPathInfo, Terminal } from "@papit/util-cli";

// local imports 
import { upgrade } from "../socket";
// import { request as handlerequest } from "../request";
import { Translation } from "../asset";

let PORT = Number(Arguments.args.flags.port || 3000);
let attempts = 0;

export let server: null | http.Server = null;

export function start(
  info: ReturnType<typeof getPathInfo>,
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
) {
  server = http.createServer();

  server.listen(PORT + attempts, () => {
    Arguments.args.flags.port = (PORT + attempts) + "";
    if (process.env.LOGLEVEL !== "none") {
      Terminal.write("server:", Terminal.blue(String(PORT + attempts)), Terminal.yellow("- running"));

      fs.appendFileSync(path.join(process.env.LOCATION as string, ".temp/.info"), `PORT=${PORT + attempts}`)
    }
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

    res.end(html`
        
    `)

  });

  server.on('error', (error: Error) => {
    if (!('code' in error)) return;
    if (error.code !== "EADDRINUSE") return;

    attempts++;

    if (attempts < 10) 
    {
      if (server) server.close();
      start(info, translations, assets);
    }
    else 
    {
      Terminal.error(`port spaces between [${PORT}, ${PORT + attempts}] are all taken, please free up some ports`);
      process.exit(1);
    }
  });

  // socket related
  server.on('upgrade', upgrade);
}

export function close() {
  server?.close();
  if (Arguments.args.flags.info) {
    Terminal.write("server:", Terminal.blue(String(PORT + attempts)), Terminal.yellow("- shutdown"));
  }
}