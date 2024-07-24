export * from './utils/http';

import { start, close } from "./utils/http"
import { cleanup as esbuild_cleanup } from "./utils/esbuild";

process.on('EXIT', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

let cleanupcalls = 0;
function cleanup() {
  if (cleanupcalls > 0) return;
  cleanupcalls++;
  console.log(''); // this creates a extra after the <breakline>:"^C"

  esbuild_cleanup();

  close();
  process.exit(0);  // This is important to ensure the process actually terminates
}

// this 
if (process.env.AUTOSTART) {
  start();
}