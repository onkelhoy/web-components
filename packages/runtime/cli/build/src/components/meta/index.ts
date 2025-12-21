import path from "node:path";
import fs from "node:fs";
import { Package, Terminal, getArguments, getConfig, getJSON, getPackageInfo } from "@papit/cli-util";
import { getTSConfiginfo } from "./ts-info";
import { getEntryPoints } from "./entry-point";
import { Meta } from "./types";

export async function getMeta(
  mode: "prod"|"dev", 
  info: ReturnType<typeof getPackageInfo>, 
  args: ReturnType<typeof getArguments>,
  packageJSON: Package,
) {
  const storedFile = path.join(info.local, `.papit/build-meta/${mode}.json`);
  if (fs.existsSync(storedFile) && !args.flags.clean && !args.flags.force) 
  {
    const json = getJSON<Meta>(storedFile);
    if (json !== null) return json;
  }

  const config = getConfig(path.join(info.local, ".config"));
  if (!config)
  {
    Terminal.error(".config file not found");
    process.exit(1);
  }

  const devTSconfig = path.join(info.local, "tsconfig.json");
  const prodTSconfig = path.join(info.local, "tsconfig.prod.json");
  
  let tsconfigFilePath = devTSconfig;
  if (mode === "prod" && fs.existsSync(prodTSconfig) && fs.statSync(prodTSconfig).isFile())
  {
    tsconfigFilePath = prodTSconfig;
  }

  const tsConfigInfo = getTSConfiginfo(tsconfigFilePath);
  const entryPoints = getEntryPoints(info, packageJSON, args);
  const entryPointKeys = Object.keys(entryPoints);

  if (entryPointKeys.length === 0)
  {
    Terminal.error("could not find any build entries");
    process.exit(1);
  }

  const meta: Meta = {
    entryPoints: {
      record: entryPoints,
      keys: entryPointKeys,
    },
    externals: [
      ...Object.keys(packageJSON.dependencies || {}),
      ...Object.keys(packageJSON.peerDependencies || {}),
    ],
    tsconfig: {
      info: tsConfigInfo,
      path: tsconfigFilePath,
    },
    config,
  }

  if (!args.flags.ci)
  {
    fs.mkdirSync(path.dirname(storedFile), { recursive: true });
    fs.writeFileSync(storedFile, JSON.stringify(meta));    
  }

  return meta;
}