// import statements 
import path from "node:path";
import fs from "node:fs";
import { Arguments, LocalPackage, Package, Terminal, getDependencyBloodline, getDependencyOrder, getJSON, getPathInfo } from "@papit/util-cli";

import { getMeta } from "./components/meta/get-meta";
import { jsBundler } from "./components/bundlers/js-bundle";
import { tsBundler } from "./components/bundlers/ts-bundle";
import { spawnCommand } from "helper";

async function runBatch(name: string, location: string|undefined, mode: "dev" | "prod", originalinfo: ReturnType<typeof getPathInfo>) {
  const info = getPathInfo(location);
  const packageJSON = getJSON<LocalPackage>(path.join(info.local, "package.json"));
  if (!packageJSON)
  {
    Terminal.error(`${name}'s package.json not found`);
    process.exit(1);
  }

  return runner(mode, info, packageJSON, originalinfo);
}

async function npmInstall(originalinfo: ReturnType<typeof getPathInfo>) {

  if (!Arguments.args.flags.ci)
  {
    if (Arguments.verbose) console.log('running install');
    await spawnCommand("npm install", originalinfo.root);
  }
  else if (Arguments.verbose)
  {
    console.log('no install');
  }
}

(async function () {
  const mode = Arguments.args.flags.dev ? "dev" : "prod";
  const location = Arguments.args.flags.location;
  const originalinfo = getPathInfo(typeof location === "string" ? location : undefined);

  if (Arguments.args.flags.all) 
  {
    return await getDependencyOrder(async batch => {
      const shouldinstall = await Promise.all(batch.map(async b => runBatch(b.name, b.location, mode, originalinfo)));
      if (shouldinstall.some(Boolean)) await npmInstall(originalinfo);
    }, { info: originalinfo });
  }

  const packageJSON = getJSON<LocalPackage>(path.join(originalinfo.local, "package.json"));
  if (!packageJSON)
  {
    Terminal.error("package.json not found");
    process.exit(1);
  }

  let bloodlineType = undefined;
  if (Arguments.args.flags.bloodline) bloodlineType = "bloodline" as const;
  else if (Arguments.args.flags.ancestors) bloodlineType = "ancestors" as const;
  else if (Arguments.args.flags.descendants) bloodlineType = "descendants" as const;

  if (!bloodlineType)
  {
    const shouldinstall = await runner(mode, originalinfo, packageJSON, originalinfo);
    if (shouldinstall) await npmInstall(originalinfo);

    return;
  }

  if (Arguments.verbose)
  {
    Terminal.write(`building using ${bloodlineType} mode`);
  }
  await getDependencyBloodline(packageJSON.name, async batch => {
    const shouldinstall = await Promise.all(batch.map(async b => runBatch(b.name, b.location, mode, originalinfo)));
    if (shouldinstall.some(Boolean)) await npmInstall(originalinfo);
  }, {
    info: originalinfo,
    type: bloodlineType,
  });
}());

function getExportsInformation(entry:string, packageJSON:Package) {
  if (!packageJSON.exports) return null;
  if (entry === "bundle") entry = ".";

  return packageJSON.exports[entry] ?? null;
}

async function runner(
  mode: "prod"|"dev",
  info: ReturnType<typeof getPathInfo>,
  packageJSON: LocalPackage,
  originalinfo: ReturnType<typeof getPathInfo>,
) {
  const session = Terminal.createSession();
  if (!packageJSON.scripts?.build)
  {
    Terminal.warn(`${packageJSON.name} does not have build script defined - skipped`);
    return;
  }

  if (packageJSON.scripts.prebuild && info.local !== originalinfo.local)
  {
    if (Arguments.verbose)
    {
      console.log(`${packageJSON.name} - running prebuild script`);
    }
    await spawnCommand(packageJSON.scripts.prebuild, info.local);

    if (Arguments.verbose)
    {
      console.log(`${packageJSON.name} - running prebuild script`);
    }
  }

  const meta = await getMeta(mode, info, packageJSON);
  
  if (Arguments.verbose)
  {
    console.log("build-mode:", mode);
    console.log("package:", info.local);
    console.log("tsconfig:", meta.tsconfig.path);
    console.log("format:", packageJSON.type === "module" ? "esm" : "cjs");
    console.log("platform:", ["node"].includes(meta.config.type ?? "web-component") ? "node" : "browser");
    console.log();
  }

  if (meta.tsconfig.info.outDir)
  {
    if (Arguments.verbose)
    {
      console.log(`removing "${meta.tsconfig.info.outDir}"`)
    }
    fs.rmSync(meta.tsconfig.info.outDir, { recursive: true, force: true });
    fs.mkdirSync(meta.tsconfig.info.outDir, { recursive: true });
  }

  let shouldinstall = false;
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
    if (Arguments.verbose)
    {
      Terminal.write(`• entryPoint "${Terminal.colorWrap(entryPointKey, "blue")}"`);
      Terminal.write(`  ↳ (${Terminal.colorWrap("bundle", "red")}) "${Terminal.colorWrap(absoluteEntry.replace(info.local, ""), "blue")}" -> "${Terminal.colorWrap(javascriptFileOutput.replace(info.local, ""), "green")}"`);
      Terminal.write(`  ↳ (${Terminal.colorWrap("types", "red")}) "${Terminal.colorWrap(absoluteTypesEntry.replace(info.local, ""), "blue")}" -> "${Terminal.colorWrap(typescriptFileOutput.replace(info.local, ""), "green")}"\n`);
    }
  
    await jsBundler(absoluteEntry, javascriptFileOutput, meta, packageJSON);
    await tsBundler(absoluteTypesEntry, typescriptFileOutput, meta, info);

    if (binEntry)
    {
      if (Arguments.verbose)
      {
        Terminal.write(Terminal.colorWrap('bin found', "green"), binEntry, "\n");
      }
      // add shebang and remove from root/node_modeles/.bin
      if (!Arguments.args.flags.ci)
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
      shouldinstall = true;
    }
  }

  if (!Arguments.verbose && !Arguments.debug && !Arguments.args.flags.all && !Arguments.args.flags.bloodline && !Arguments.args.flags.ancestors && !Arguments.args.flags.descendants)
  {
    Terminal.clearSession(session);
  }

  Terminal.write("📦", packageJSON.name, Terminal.colorWrap("successfully built", "green"));
  return shouldinstall;
}