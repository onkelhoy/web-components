import path from "node:path";
import fs from "node:fs";
import { Arguments, LocalPackage, Terminal, getJSON, getPathInfo, getScope } from "@papit/util";
import { getTSinfo } from "./get-tsinfo";
import { getEntryPoints } from "./get-entrypoints";
import { Meta } from "./types";

export async function getMeta(
  mode: "prod" | "dev",
  info: ReturnType<typeof getPathInfo>,
  packageJSON: LocalPackage,
) {
  const storedFile = path.join(info.package, `.temp/build-meta/${mode}.json`);
  if (fs.existsSync(storedFile) && !Arguments.args.flags.clean && !Arguments.args.flags.force) 
  {
    if (Arguments.debug) Terminal.write(Terminal.green('loading stored meta file'), storedFile);
    const json = getJSON<Meta>(storedFile);
    if (json !== null) return json;
  }

  const config: LocalPackage["papit"] = packageJSON.papit ?? {};

  const devTSconfig = path.join(info.package, "tsconfig.json");
  const prodTSconfig = path.join(info.package, "tsconfig.prod.json");

  let tsconfigFilePath = devTSconfig;
  if (mode === "prod" && fs.existsSync(prodTSconfig) && fs.statSync(prodTSconfig).isFile())
  {
    tsconfigFilePath = prodTSconfig;
  }

  const tsConfigInfo = getTSinfo(tsconfigFilePath);
  const entryPoints = getEntryPoints(info, packageJSON);
  const entryPointKeys = Object.keys(entryPoints);

  if (entryPointKeys.length === 0)
  {
    console.log({
      entryPoints,
      name: packageJSON.name,
      package: info.package
    })
    throw new Error("could not find any build entries");
  }

  let externals = [
    packageJSON.name, 
    ...Object.keys(packageJSON.dependencies || {}),
    ...Object.keys(packageJSON.peerDependencies || {}),
  ];

  if (Arguments.args.flags['no-bundle'])
  {
    // externals = externals.filter(name => !name.startsWith(scope));
  }

  const meta: Meta = {
    entryPoints: {
      record: entryPoints,
      keys: entryPointKeys,
    },
    externals,
    tsconfig: {
      info: tsConfigInfo,
      path: tsconfigFilePath,
    },
    config,
  }

  if (!Arguments.args.flags.ci)
  {
    fs.mkdirSync(path.dirname(storedFile), { recursive: true });
    fs.writeFileSync(storedFile, JSON.stringify(meta));
  }

  return meta;
}