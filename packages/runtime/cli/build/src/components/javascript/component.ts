// import statements 
import esbuild from "esbuild";
import { Package, Terminal, getArguments, getConfig, getPackageInfo } from "@papit/cli-util";
import path from "node:path";

export async function javascript(
  inputFile: string, 
  outputFile: string, 
  tsconfigFilePath: string, 
  packageJSON: Package, 
  info: ReturnType<typeof getPackageInfo>,
  config: NonNullable<ReturnType<typeof getConfig>>, 
  externals: string[], 
  args: ReturnType<typeof getArguments>
) {
  const esbuildInfo = await esbuild.build({
    entryPoints: [inputFile],
    bundle: true,
    outfile: path.join(info.local, "temp", outputFile + ".js"),
    minify: true,
    tsconfig: tsconfigFilePath,
    format: packageJSON.type === "module" ? "esm" : "cjs",
    platform: ["node"].includes(config.TEMPLATE_TYPE ?? "web-component") ? "node" : "browser",
    external: externals,
  });

  if (esbuildInfo.errors)
  {
    if (args.flags.verbose)
    {
      Terminal.error(JSON.stringify(esbuildInfo.errors, null, 2));
    }

    Terminal.error("esbuild had errors", args.flags.verbose ? "" : "run with --verbose flag for details");
    process.exit(1);
  }

  if (esbuildInfo.warnings)
  {
    if (args.flags.verbose)
    {
      Terminal.warn(JSON.stringify(esbuildInfo.warnings, null, 2));
    }

    Terminal.warn("esbuild had warnings", args.flags.verbose ? "" : "run with --verbose flag for details");
  }

  return esbuildInfo;
}