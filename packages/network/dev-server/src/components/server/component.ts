// import statements 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { Arguments, Terminal } from "@papit/util-cli";

// local imports 
import { upgrade } from "../socket";
import { request as handlerequest } from "../request";

let PORT = Number(Arguments.args.flags.port || 3000);
let attempts = 0;

export let server: null | http.Server = null;

export function start() {
  server = http.createServer();

  server.listen(PORT + attempts, () => {
    Arguments.args.flags.port = (PORT + attempts) + "";
    if (process.env.LOGLEVEL !== "none") {
      Terminal.write("server:", Terminal.blue(String(PORT + attempts)), Terminal.yellow("- running"));

      fs.appendFileSync(path.join(process.env.LOCATION as string, ".temp/.info"), `PORT=${PORT + attempts}`)
    }
  });

  // events 
  server.on("request", handlerequest);
  server.on('error', (error: Error) => {
    if (!('code' in error)) return;
    if (error.code !== "EADDRINUSE") return;

    attempts++;

    if (attempts < 10) 
    {
      if (server) server.close();
      start();
    }
    else if (Arguments.args.flags.error) 
    {
      Terminal.error(`port spaces between [${Arguments.args.flags.port || 3000}, ${PORT + attempts}] are all taken, please free up some ports`);
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