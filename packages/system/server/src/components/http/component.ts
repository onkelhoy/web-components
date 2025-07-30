// import statements 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// local imports 
import { upgrade } from "../socket";
import { request as handlerequest } from "../request";

let PORT = Number(process.env.PORT || 3000);
let attempts = 0;

export let server: null | http.Server = null;

export function start() {
  server = http.createServer();

  server.listen(PORT + attempts, () => {
    process.env.PORT = (PORT + attempts) + "";
    if (process.env.LOGLEVEL !== "none") {
      console.log("\x1b[33m", `server:\x1b[36m${PORT + attempts}\x1b[33m  - running`, "");

      fs.appendFileSync(path.join(process.env.LOCATION as string, ".temp/.info"), `PORT=${PORT + attempts}`)
    }
  });

  // events 
  server.on("request", handlerequest);
  server.on('error', (error: Error) => {
    if ('code' in error && error.code === "EADDRINUSE") {
      attempts++;
      if (attempts < 10) {
        if (server) server.close();
        start();
      }
      else if (process.env.LOGLEVEL !== "none") {
        console.log(`[error] port spaces between [${process.env.PORT || 3000}, ${PORT + attempts}] are all taken, please free up some ports`);
      }
    }
  });

  // socket related
  server.on('upgrade', upgrade);
}

export function close() {
  server?.close();
  if (process.env.LOGLEVEL !== "none") {
    console.log("\x1b[33m", `server:\x1b[36m${PORT + attempts}\x1b[33m - shutdown`, "");
  }
}