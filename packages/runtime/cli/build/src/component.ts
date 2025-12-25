// import statements 
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { LocalPackage, Package, Terminal, getArguments, getDependencyBloodline, getDependencyOrder, getJSON, getPathInfo } from "@papit/util-cli";

import { getMeta } from "./components/meta/get-meta";
import { jsBundler } from "./components/bundlers/js-bundle";
import { tsBundler } from "./components/bundlers/ts-bundle";

import { exec } from "node:child_process";
import { promisify } from "node:util";
const execAsync = promisify(exec);


(async function () {
  const args = getArguments([
    "verbose", 
    "debug",
    "prod", 
    "dev", 
    "force", 
    "clean", 
    "ci", 
    "bloodline", 
    "ancestors", 
    "descendants", 
    "all"
  ]);
  const mode = args.flags.dev ? "dev" : "prod";
  const location = args.flags.location;
  const originalinfo = getPathInfo(typeof location === "string" ? location : undefined);

  if (args.flags.all) 
  {
    await getDependencyOrder(async batch => {
      for (const b of batch) {
        
        const info = getPathInfo(b.location);
        console.log(info.local, info.root)
        const packageJSON = getJSON<LocalPackage>(path.join(info.local, "package.json"));
        if (!packageJSON)
        {
          Terminal.error(`${b.name}'s package.json not found`);
          process.exit(1);
        }

        return await runner(mode, info, args, packageJSON, originalinfo);
      }
    }, { args, info: originalinfo });
  }


  const packageJSON = getJSON<LocalPackage>(path.join(originalinfo.local, "package.json"));
  if (!packageJSON)
  {
    Terminal.error("package.json not found");
    process.exit(1);
  }

  let bloodlineType = undefined;
  if (args.flags.bloodline) bloodlineType = "bloodline" as const;
  else if (args.flags.ancestors) bloodlineType = "ancestors" as const;
  else if (args.flags.descendants) bloodlineType = "descendants" as const;

  if (!bloodlineType)
  {
    return await runner(mode, originalinfo, args, packageJSON, originalinfo);
  }
  else 
  {
    if (args.flags.verbose)
    {
      Terminal.write(`building using ${bloodlineType} mode`);
    }

    await getDependencyBloodline(packageJSON.name, async batch => {
      for (const b of batch) {
        
        const info = getPathInfo(b.location);
        const packageJSON = getJSON<LocalPackage>(path.join(info.local, "package.json"));
        if (!packageJSON)
        {
          Terminal.error(`${b.name}'s package.json not found`);
          process.exit(1);
        }

        return await runner(mode, info, args, packageJSON, originalinfo);
      }
    }, {
      args,
      info: originalinfo,
      type: bloodlineType,
    });
  }
}());

function getExportsInformation(entry:string, packageJSON:Package) {
  if (!packageJSON.exports) return null;
  if (entry === "bundle") entry = ".";

  return packageJSON.exports[entry] ?? null;
}


function runPrebuildCommand(command: string, cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        PAPIT_PREBUILD: "1",
      },
    });

    child.on("exit", code => {
      if (code === 0) resolve();
      else reject(new Error(`prebuild failed (${code})`));
    });
  });
}

async function runner(
  mode: "prod"|"dev",
  info: ReturnType<typeof getPathInfo>,
  args: ReturnType<typeof getArguments>,
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
    if (args.flags.verbose)
    {
      console.log(`${packageJSON.name} - running prebuild script`);
    }
    await Terminal.sessionBlock(async () => runPrebuildCommand(packageJSON.scripts!.prebuild, info.local));
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

  if (meta.tsconfig.info.outDir)
  {
    if (args.flags.verbose)
    {
      console.log(`removing "${meta.tsconfig.info.outDir}"`)
    }
    fs.rmSync(meta.tsconfig.info.outDir, { recursive: true, force: true });
    fs.mkdirSync(meta.tsconfig.info.outDir, { recursive: true });
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
  
    await jsBundler(absoluteEntry, javascriptFileOutput, meta, packageJSON, args);
    await tsBundler(absoluteTypesEntry, typescriptFileOutput, meta, info, args);

    if (binEntry)
    {
      if (args.flags.verbose)
      {
        Terminal.write(Terminal.colorWrap('bin found', "green"), binEntry, "\n");
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

  if (!args.flags.verbose && !args.flags.debug)
  {
    Terminal.clearSession(session);
  }

  Terminal.write("\n📦", packageJSON.name, Terminal.colorWrap("successfully built", "green"));
}