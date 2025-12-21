import path from "node:path";

import { start as httpstart, close } from "./components/http"
import { cleanup as esbuild_cleanup } from "./components/esbuild";
import { init as dependencyinit } from "./components/dependency";
import { init as assetinit } from "./components/asset";
import { save as savetranslations } from "./components/language";
// import { init as assetinit } from './components/asset';
// import { init as languageinit } from "./components/language";

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

export function start() {
  dependencyinit(name => console.log("-", name, "added"));
  assetinit();

  if (process.env.OUTPUT_TRANSLATIONS) {
    let location = process.env.OUTPUT_TRANSLATIONS;
    if (process.env.OUTPUT_TRANSLATIONS === "true") {
      location = path.join(process.env.LOCATION || "", ".temp/translations");
    }
    savetranslations(location);
  }

  httpstart();
}

// this is useless.. its ALWAYS autostart (for now atleast)
if (process.env.AUTOSTART) {
  start();
}