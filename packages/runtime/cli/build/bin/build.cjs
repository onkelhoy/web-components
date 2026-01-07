const esbuild = require("esbuild");
const packageJSON = require('../package.json');

const externals = [...Object.keys(packageJSON.dependencies || {}), ...Object.keys(packageJSON.peerDependencies || {})];

(async function () {

  console.log('something is super wird', packageJSON, esbuild.build)
  const esbuildInfo = await esbuild.build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    outfile: ".temp/bundle.js",
    minify: true,
    logLevel: "debug",
    format: packageJSON.type === "module" ? "esm" : "cjs",
    platform: ["node"].includes(packageJSON.papit?.type ?? "node") ? "node" : "browser",
    external: externals,
  });

  // if (esbuildInfo.errors.length > 0)
  // {
  //   console.log("ERRORS", esbuildInfo.errors);
  //   process.exit(1);
  // }
}());
