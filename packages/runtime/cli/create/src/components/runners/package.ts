import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import {
  getJSON,
  getScope,
  getPackage,
  getName,
  copyFolder,
  Terminal,
  getPackageInfo,
  getConfig,
  getScriptScope,
  type Lockfile,
  type Package,
  getArguments,
} from "@papit/cli-util"
import { createFolderConfig, getFolders, selectFolder } from "components/util";
import { componentRunner } from "./component";

const execAsync = promisify(exec);

export async function packageRunner(scriptdir: string, args: ReturnType<typeof getArguments>) {
  const session = Terminal.createSession();

  const info = getPackageInfo();
  const scope = getScope();

  const layer = await selectFolder({
    ...info,
    scope,
  }, args);


  const templateFolders = getFolders(path.join(scriptdir, "asset/package-templates/"));

  const argType = args.flags.package ?? args.flags.type;
  let templateIndex = templateFolders.findIndex(t => t === argType);
  if (templateIndex < 0)
  {
    Terminal.write("type of package");
    templateIndex = await Terminal.option(templateFolders);
  }
  Terminal.clearSession();

  const template = templateFolders[templateIndex];
  
  let htmlPrefix:string|undefined = undefined;
  if (Array.isArray(args.flags['html-prefix'])) htmlPrefix = args.flags['html-prefix'].join("-");
  else if (typeof args.flags['html-prefix'] === "string") htmlPrefix = args.flags['html-prefix'];
  if (htmlPrefix?.trim() === "") htmlPrefix = undefined;

  if (!htmlPrefix && /web-components?/i.test(template))
  {
    const rootConfig = getConfig(path.join(info.root, ".config"));

    if (!htmlPrefix) htmlPrefix = rootConfig?.HTML_PREFIX;

    Terminal.createSession();
    while (true) 
    {
      let answer:string;
      if (htmlPrefix)
      {
        answer = await Terminal.prompt(`use default "${htmlPrefix}" or override?`);
        if (!answer) answer = htmlPrefix;
      }
      else 
      {
        answer = await Terminal.prompt("html prefix", true);
      }
      
      if (answer) 
      {
        htmlPrefix = answer;
        break;
      }
      else 
      {
        Terminal.clearSession();
        Terminal.warn("you must use a html-prefix for web-components")
      }
    }
    Terminal.clearSession();
  }

  let localFolder = layer.replace(info.root, '');
  if (localFolder.startsWith("/"))
    localFolder = localFolder.slice(1);

  const layerBasename = path.basename(layer);
  let layerConfig = getConfig(path.join(layer, ".config"));

  if (!layerConfig)
  {
    Terminal.warn(".config file is missing");
    await createFolderConfig(layer, layerBasename);
    layerConfig = getConfig(path.join(layer, ".config"))!;
  }

  const rootPackage = getJSON<Package>(path.join(info.root, "package.json"));
  if (rootPackage === null)
  {
    Terminal.error("root package.json not found");
    process.exit(1);
  }
  if (!rootPackage.repository?.url)
  {
    Terminal.error("root package.json does not have 'repository.url'");
    process.exit(1);
  }

  const repository = rootPackage.repository.url.replace(/\.git$/, '');
  const lockfile_location = path.join(info.root, "package-lock.json");

  let lockfile = getJSON<Lockfile>(lockfile_location);
  if (lockfile === null)
  {
    await execAsync('npm install');
    lockfile = getJSON<Lockfile>(lockfile_location);
  }

  Terminal.clearSession(session); // this will also create session
  let nameInfo: ReturnType<typeof getName>;
  while (true)
  {
    Terminal.clearSession();
    let input:string|undefined = undefined;
    if (Array.isArray(args.flags.name)) input = args.flags.name.join(" ");
    else if (typeof args.flags.name === "string") input = args.flags.name;
    else input = await Terminal.prompt("(package) name", true);

    nameInfo = getName(input);

    if (!nameInfo) 
    {
      Terminal.write("name missing, try again");
      continue;
    }
    if (lockfile && getPackage(`${scope}/${nameInfo.name}`, lockfile))
    {

      Terminal.write("package already exists, try again")
      continue;
    }

    break;
  }

  const fullName = `${scope}/${layerConfig.LAYER_INCLUDE === "prefix" ? layerConfig.LAYER_NAME + "-" : ""}${nameInfo.name}${layerConfig.LAYER_INCLUDE === "suffix" ? "-" + layerConfig.LAYER_NAME : ""}`;
  let description = Array.isArray(args.flags.description) ? args.flags.description.join(" ") : args.flags.description;
  if (!description || description === true) description = await Terminal.prompt("description", true);

  Terminal.write();
  Terminal.createSession();
  
  const destination = path.join(layer, nameInfo.name);

  // Copy package template
  await copyFolder(path.join(scriptdir, "asset/package-templates", template), destination, async (file, src) => {
    if (src.endsWith(".gitkeep")) return false;
    
    const final = file
      .replace(/VARIABLE_NAME/g, nameInfo.name)
      .replace(/VARIABLE_FULL_NAME/g, fullName)
      .replace(/VARIABLE_DESCRIPTION/g, description)
      .replace(/VARIABLE_LAYER_FOLDER/g, layerBasename)
      .replace(/VARIABLE_LAYER_NAME/g, layerConfig.LAYER_NAME ?? layerBasename)
      .replace(/VARIABLE_PROJECTLICENSE/g, rootPackage.license || "MIT")
      .replace(/VARIABLE_GITHUB_REPO/g, repository)
      .replace(/VARIABLE_LOCAL_DESTINATION/g, localFolder)
      .replace(/VARIABLE_CLASS_NAME/g, nameInfo.className)
      .replace(/VARIABLE_HTML_PREFIX/g, htmlPrefix ?? "")
      .replace(/VARIABLE_USER/g, process.env.USER ?? "anonymous");

    return final;
  });

  Terminal.createSession();
  const shouldInstall = 'agree' in args.flags || 'install' in args.flags || await Terminal.confirm("install package", true);
  if (shouldInstall)
  {
    try {
      await execAsync('npm install');
      Terminal.clearSession();
    }
    catch {
      Terminal.warn("error during install");
    }
  }
  else 
  {
    Terminal.clearSession();
  }

  const shouldCommit = 'agree' in args.flags || 'commit' in args.flags || await Terminal.confirm("git commit", true);

  await componentRunner(scriptdir, args, { destination, nameInfo, htmlPrefix, shouldCommit });

  if (shouldCommit)
  {
    try {
      await execAsync(`git add ${lockfile_location}`);
      await execAsync(`git add ${destination}`);
      await execAsync(`git commit -m "add: ${fullName} package"`);
      Terminal.clearSession();
    } 
    catch {
      Terminal.warn("error during commit");
    }
  }
  else 
  {
    Terminal.clearSession();
  }

  Terminal.write(`${fullName} created\n`);

}