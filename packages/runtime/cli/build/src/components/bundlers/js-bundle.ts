// import statements 
import esbuild from "esbuild";
import { Package, Terminal, getArguments } from "@papit/cli-util";

import { Meta } from "../meta/types";

export async function jsBundler(
  inputFile: string, 
  outputFile: string, 
  meta: Meta, 
  packageJSON: Package, 
  args: ReturnType<typeof getArguments>,
) {

  const esbuildInfo = await esbuild.build({
    entryPoints: [inputFile],
    bundle: true,
    outfile: outputFile,
    minify: true,
    tsconfig: meta.tsconfig.path,
    format: packageJSON.type === "module" ? "esm" : "cjs",
    platform: ["node"].includes(meta.config.TEMPLATE_TYPE ?? "web-component") ? "node" : "browser",
    external: meta.externals,
  });

  if (esbuildInfo.errors.length > 0)
  {
    if (args.flags.verbose)
    {
      Terminal.error(JSON.stringify(esbuildInfo.errors, null, 2));
    }

    Terminal.error("esbuild had errors", args.flags.verbose ? "" : "run with --verbose flag for details");
    process.exit(1);
  }

  if (esbuildInfo.warnings.length > 0)
  {
    if (args.flags.verbose)
    {
      Terminal.warn(JSON.stringify(esbuildInfo.warnings, null, 2));
    }

    Terminal.warn("esbuild had warnings", args.flags.verbose ? "" : "run with --verbose flag for details");
  }

  return esbuildInfo;
}