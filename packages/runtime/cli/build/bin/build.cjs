const esbuild = require("esbuild");
const packageJSON = require('../package.json');

const externals = [...Object.keys(packageJSON.dependencies || {}), ...Object.keys(packageJSON.peerDependencies || {})];

(async function () {

  const esbuildInfo = await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: ".papit/bundle.js",
    minify: true,
    format: packageJSON.type === "module" ? "esm" : "cjs",
    platform: ["node"].includes(packageJSON.papit?.type ?? "node") ? "node" : "browser",
    external: externals,
  });

  if (esbuildInfo.errors.length > 0)
  {
    console.log("ERRORS", esbuildInfo.errors);
    process.exit(1);
  }
}());
