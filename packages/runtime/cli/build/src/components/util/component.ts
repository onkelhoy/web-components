// import statements 
import path from "node:path";
import fs from "node:fs";
import { Package, getArguments, getPackageInfo } from "@papit/cli-util";

export function getEntryPoints(info: ReturnType<typeof getPackageInfo>, packageJSON: Package, args: ReturnType<typeof getArguments>) {

  let entryPointsValues:Record<string,string>|string[]|string = {};
  if (args.flags.entry && args.flags.entry !== true)
  {
    entryPointsValues = args.flags.entry;
  }
  else if (packageJSON.entryPoints)
  {
    entryPointsValues = packageJSON.entryPoints;
  }
  else if (packageJSON.exports)
  {
    entryPointsValues = {};
    for (const entry in packageJSON.exports)
    {
      if (entry === ".") entryPointsValues.bundle = "src/index.ts";
      else 
      {
        entryPointsValues[entry] = `src/${entry}/index.ts`; // we try this.. 
      }
    }
  }
  else 
  {
    entryPointsValues = path.join(info.local, "src/index.ts");
  }

  let entryPoints:Record<string,string> = {}
  if (typeof entryPointsValues === "string")
  {
    entryPoints.bundle = entryPointsValues; // default case
  }
  else if (Array.isArray(entryPointsValues))
  {
    for (const entry of entryPointsValues)
    {
      entryPoints[path.parse(entry).name] = entry;
    }
  }
  else 
  {
    entryPoints = entryPointsValues;
  }

  // now we should "fix" the entires to actual locations. we only check inside "src" flattly
  for (let key in entryPoints)
  {
    const entry = entryPoints[key];
    if (fs.existsSync(entry) && fs.statSync(entry).isFile()) continue;
    const joined = path.join(info.local, "src", entry);

    if (fs.existsSync(joined) && fs.statSync(joined).isFile()) 
    {
      entryPoints[key] = joined;
    }
    else 
    {
      delete entryPoints[key];
    }
  }

  return entryPoints;
}

export function getExportsInformation(entry:string, entryFile:string, packageJSON:Package) {
  if (!packageJSON.exports) return null;
  if (entry === "bundle") entry = ".";

  if (packageJSON.exports[entry]) return packageJSON.exports[entry];
}