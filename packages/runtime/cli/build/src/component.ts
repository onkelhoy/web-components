// import statements 
import path from "node:path";
import fs from "node:fs";
import { LocalPackage, Package, Terminal, getArguments, getJSON, getPathInfo } from "@papit/util-cli";

import { getMeta } from "./components/meta/get-meta";
export { getMeta } from "./components/meta/get-meta";

import { jsBundler } from "./components/bundlers/js-bundle";
import { tsBundler } from "./components/bundlers/ts-bundle";

export { jsBundler } from "./components/bundlers/js-bundle";
export { tsBundler } from "./components/bundlers/ts-bundle";

import { exec } from "node:child_process";
import { promisify } from "node:util";
const execAsync = promisify(exec);

function getExportsInformation(entry:string, packageJSON:Package) {
  if (!packageJSON.exports) return null;
  if (entry === "bundle") entry = ".";

  return packageJSON.exports[entry] ?? null;
}

(async function () {
  const session = Terminal.createSession();
  const args = getArguments(["verbose", "prod", "dev", "force", "clean", "ci"]);

  const info = getPathInfo();
  const mode = args.flags.dev ? "dev" : "prod";

  const packageJsonPath = path.join(info.local, "package.json");
  const packageJSON = getJSON<LocalPackage>(packageJsonPath);
  if (!packageJSON)
  {
    Terminal.error("package.json not found");
    process.exit(1);
  }

  const meta = await getMeta(mode, info, args, packageJSON);
  
  if (args.flags.verbose)
  {
    console.log("build-mode:", mode);
    console.log("package:", info.local);
    console.log("tsconfig:", meta.tsconfig.path);
    console.log("format:", packageJSON.type === "module" ? "esm" : "cjs");
    console.log("platform:", ["node"].includes(meta.config.type ?? "web-component") ? "node" : "browser");
    console.log();
  }

  for (const entryPointKey of meta.entryPoints.keys) 
  {
    const entryPoint = meta.entryPoints.record[entryPointKey];
  
    const exportsInformation = getExportsInformation(entryPointKey, packageJSON);
    let javascriptFileOutput = path.join(info.local, entryPoint.replace("src", "lib")+".js");
    let typescriptFileOutput = path.join(info.local, entryPoint.replace("src", "lib")+".d.ts");
  
    if (!exportsInformation) 
    {
      Terminal.warn(`"${entryPointKey}" does not exists in package.exports`);
    }
    else 
    {
      if (exportsInformation.import)
      {
        javascriptFileOutput = path.join(info.local, exportsInformation.import);
      }
      if (exportsInformation.types)
      {
        typescriptFileOutput = path.join(info.local, exportsInformation.types);
      }
    }

    let binEntry: string|null = null;
    if (packageJSON.bin)
    {
      for (const binEntryKey in packageJSON.bin)
      {
        let binValue = packageJSON.bin[binEntryKey];
        if (binValue.startsWith("./")) binValue = binValue.slice(1);
        if (javascriptFileOutput.endsWith(binValue))
        {
          binEntry = binEntryKey;
          break;
        }
      }
    }
  
    const absoluteEntry = entryPoint.startsWith(info.local) ? entryPoint : path.join(info.local, entryPoint);
    const absoluteTypesEntry = absoluteEntry.replace(info.local, path.join(info.local, ".papit/build")).replace(".ts", ".d.ts");
    if (args.flags.verbose)
    {
      Terminal.write(`• entryPoint "${Terminal.colorWrap(entryPointKey, "blue")}"`);
      Terminal.write(`  ↳ (${Terminal.colorWrap("bundle", "red")}) "${Terminal.colorWrap(absoluteEntry.replace(info.local, ""), "blue")}" -> "${Terminal.colorWrap(javascriptFileOutput.replace(info.local, ""), "green")}"`);
      Terminal.write(`  ↳ (${Terminal.colorWrap("types", "red")}) "${Terminal.colorWrap(absoluteTypesEntry.replace(info.local, ""), "blue")}" -> "${Terminal.colorWrap(typescriptFileOutput.replace(info.local, ""), "green")}"\n`);
    }
  
    await jsBundler(entryPoint, javascriptFileOutput, meta, packageJSON, args);
    await tsBundler(absoluteTypesEntry, typescriptFileOutput, meta, info, args);

    if (binEntry)
    {
      if (args.flags.verbose)
      {
        console.log('bin-entry found', binEntry, args.flags.ci);
      }
      // add shebang and remove from root/node_modeles/.bin
      if (!args.flags.ci)
      {
        const rootNodeModuleBin = path.join(info.root, "node_modules/.bin", binEntry);
        if (fs.existsSync(rootNodeModuleBin)) 
        {
          fs.rmSync(rootNodeModuleBin);
        }
      }

      const bundle = fs.readFileSync(javascriptFileOutput, { encoding: "utf-8" });
      const updated = bundle.startsWith("#!/usr/bin/env node") ? bundle : `#!/usr/bin/env node\n${bundle}`;
      fs.writeFileSync(javascriptFileOutput, updated, { mode: 0o755 });

      if (!args.flags.ci)
      {
        if (args.flags.verbose) console.log('running install');
        await execAsync("npm install", { cwd: info.root });
      }
      else if (args.flags.verbose)
      {
        console.log('no install');
      }
    }
  }

  if (!args.flags.verbose)
  {
    Terminal.clearSession(session);
  }

  Terminal.write("\n📦", packageJSON.name, Terminal.colorWrap("successfully built", "green"));
}());

