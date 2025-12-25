const esbuild = require("esbuild");
const fs = require("node:fs");
const { exec } = require("node:child_process");
const { promisify } = require("node:util");

const packageJSON = require('../package.json');

const execAsync = promisify(exec);
const externals = [...Object.keys(packageJSON.dependencies || {}), ...Object.keys(packageJSON.peerDependencies || {})];

(async function () {

  fs.rmSync("lib", { recursive: true, force: true });
  await execAsync(`tsc --emitDeclarationOnly --declarationDir lib`);
  fs.writeFileSync("lib/index.d.ts", "export * from './src';", { encoding: "utf-8" });

  const esbuildInfo = await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "lib/bundle.js",
    minify: true,
    format: packageJSON.type === "module" ? "esm" : "cjs",
    platform: ["node"].includes(packageJSON.papit?.mode ?? "node") ? "node" : "browser",
    external: externals,
  });

  if (esbuildInfo.errors.length > 0)
  {
    process.exit(1);
  }
}());