// import statements 
import path from "node:path";
import fs from "node:fs";
import { Package, Terminal, getArguments, getConfig, getJSON, getPackageInfo } from "@papit/cli-util";

import { getEntryPoints, getExportsInformation } from "components/util";
import { javascript } from "components/javascript";
import { typescript } from "components/typescript";


(async function () {
  const session = Terminal.createSession();
  const args = getArguments(["verbose", "prod", "dev"]);

  let mode = "prod";
  if (args.flags.prod) mode = "dev";

  const info = getPackageInfo();
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

  const packageJsonPath = path.join(info.local, "package.json");
  const packageJSON = await getJSON<Package>(packageJsonPath);
  if (!packageJSON)
  {
    Terminal.error("package.json not found");
    process.exit(1);
  }
  
  if (args.flags.verbose)
  {
    console.log("build-mode:", mode)
    console.log("package:", info.local)
    console.log();
  }

  const entryPoints = getEntryPoints(info, packageJSON, args);
  const entryPointKeys = Object.keys(entryPoints);

  if (entryPointKeys.length === 0)
  {
    Terminal.error("could not find any build entries");
    process.exit(1);
  }

  if (args.flags.verbose)
  {
    console.log('entryPoints', entryPoints)
  }

  const externals = [
    ...Object.keys(packageJSON.dependencies || {}),
    ...Object.keys(packageJSON.peerDependencies || {}),
  ];


  entryPointKeys.map(async entryPointKey => {

    const entryPointValue = entryPoints[entryPointKey];
    const exportsInfo = getExportsInformation(entryPointKey, entryPointValue, packageJSON);

    await javascript(entryPointKey, entryPointValue, tsconfigFilePath, packageJSON, info, config, externals, args);
    await typescript(entryPointKey, entryPointValue, tsconfigFilePath, packageJSON, info, args);
  });

  if (!args.flags.verbose)
  {
    Terminal.clearSession(session);
  }

  Terminal.write("📦", packageJSON.name, Terminal.colorWrap("successfully built", "green"));
}());
