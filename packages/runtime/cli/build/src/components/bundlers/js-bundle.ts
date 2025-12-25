// import statements 
import esbuild from "esbuild";
import { Arguments, Package, Terminal } from "@papit/util-cli";

import { Meta } from "../meta/types";

export async function jsBundler(
  inputFile: string, 
  outputFile: string, 
  meta: Meta, 
  packageJSON: Package, 
) {

  const isDev = !!Arguments.args.flags.dev;

  const esbuildInfo = await esbuild.build({
    entryPoints: [inputFile],
    bundle: true,
    outfile: outputFile,

    // 🔥 DEV vs PROD behavior
    minify: !isDev,
    sourcemap: isDev,
    treeShaking: !isDev,
    keepNames: isDev,

    tsconfig: meta.tsconfig.path,
    format: packageJSON.type === "module" ? "esm" : "cjs",
    platform: ["node"].includes(meta.config.type ?? "web-component") ? "node" : "browser",
    external: meta.externals,

    logLevel: "silent",
  });

  if (esbuildInfo.errors.length > 0)
  {
    if (Arguments.verbose)
    {
      Terminal.error(JSON.stringify(esbuildInfo.errors, null, 2));
    }

    Terminal.error("esbuild had errors", Arguments.verbose ? "" : "run with --verbose flag for details");
    process.exit(1);
  }

  if (esbuildInfo.warnings.length > 0)
  {
    if (Arguments.verbose)
    {
      Terminal.warn(JSON.stringify(esbuildInfo.warnings, null, 2));
    }

    Terminal.warn("esbuild had warnings", Arguments.verbose ? "" : "run with --verbose flag for details");
  }

  return esbuildInfo;
}