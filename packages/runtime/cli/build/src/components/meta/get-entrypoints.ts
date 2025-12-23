// import statements 
import path from "node:path";
import fs from "node:fs";
import { Package, Terminal, getArguments, getPathInfo } from "@papit/util-cli";

function extractEntryPoint(value:string|string[]|Record<string,string>, outDir: string) {
  let entryPoints:Record<string,string> = {}
  if (typeof value === "string")
  {
    entryPoints.bundle = value; // default case
  }
  else if (Array.isArray(value))
  {
    for (const entry of value)
    {
      entryPoints[path.parse(entry).name] = entry;
    }
  }
  else 
  {
    entryPoints = value;
  }
  
  for (const entry in entryPoints)
  {
    entryPoints[entry] = entryPoints[entry].replace(outDir, "src");
  }

  return entryPoints;
}
function mergeEntryPoints(
  currentEntryPoints: Record<string,string>, 
  newEntryPoints: Record<string,string>,
  args: ReturnType<typeof getArguments>,
  set: Set<string>,
) {
  for (let key in newEntryPoints)
  {
    // const { key, value } = parse(_key, newEntryPoints[_key]);
    const value = newEntryPoints[key];
    if (set.has(value)) 
    {
      if (args.flags.verbose) Terminal.warn(`entry "${key}" with its value was already defined`);
      continue;
    }

    set.add(value);

    if (currentEntryPoints[key] && currentEntryPoints[key] !== value)
    {
      Terminal.error("multiple entries found with different targets");
      process.exit(1);
    }

    currentEntryPoints[key] = value;
  }
}
export function getEntryPoints(
  info: ReturnType<typeof getPathInfo>, 
  packageJSON: Package, 
  args: ReturnType<typeof getArguments>,
  outDir: string = "lib",
) {
  const entryPoints:Record<string,string> = {}
  const set = new Set<string>();

  if (args.flags.entry && args.flags.entry !== true)
  {
    mergeEntryPoints(entryPoints, extractEntryPoint(args.flags.entry, outDir), args, set);
  }
  
  if (packageJSON.entryPoints)
  {
    mergeEntryPoints(entryPoints, extractEntryPoint(packageJSON.entryPoints, outDir), args, set);
  }

  if (packageJSON.exports)
  {
    const entryPointsValues:Record<string, string> = {};
    for (const entry in packageJSON.exports)
    {
      if (entry === ".") entryPointsValues.bundle = "src/index.ts";
      else 
      {
        entryPointsValues[entry] = `src/${entry}`; // we try this.. 
      }
    }

    mergeEntryPoints(entryPoints, extractEntryPoint(entryPointsValues, outDir), args, set);
  }

  if (packageJSON.bin)
  {
    mergeEntryPoints(entryPoints, extractEntryPoint(packageJSON.bin, outDir), args, set);
  }

  if (Object.keys(entryPoints).length === 0) 
  {
    entryPoints.bundle = path.join(info.local, "src/index.ts");
  }

  // now we should "fix" the entires to actual locations. we only check inside "src" flattly
  for (let key in entryPoints)
  {
    let entry = entryPoints[key];
    if (fs.existsSync(entry)) 
    {
      const stat = fs.statSync(entry);
      if (stat.isFile()) continue;
      if (stat.isDirectory()) entry = path.join(entry, "index.ts");
    } 
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