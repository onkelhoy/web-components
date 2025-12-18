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
import { getFolders, selectFolder } from "components/util";
import { runner as componetRunner } from "components/component";

const execAsync = promisify(exec);

export async function runner(scriptdir: string, args: ReturnType<typeof getArguments>) {
  const session = Terminal.createSession();

  const info = getPackageInfo();
  const scope = getScope();

  const layer = await selectFolder({
    ...info,
    scope,
  }, args);

  let localFolder = layer.replace(info.root, '');
  if (localFolder.startsWith("/"))
    localFolder = localFolder.slice(1);

  const layerBasename = path.basename(layer);
  const layerConfig = getConfig(path.join(layer, ".config"));

  if (!layerConfig)
  {
    Terminal.error("could not find .config");
    process.exit();
  }

  const rootPackage = getJSON<Package>(path.join(info.root, "package.json"));
  if (rootPackage === null)
  {
    Terminal.error("root package.json not found");
    process.exit();
  }
  if (!rootPackage.repository?.url)
  {
    Terminal.error("root package.json does not have 'repository.url'");
    process.exit();
  }

  const repository = rootPackage.repository.url.replace(/\.git$/, '');

  let lockfile = getJSON<Lockfile>(path.join(info.root, "package-lock.json"));
  if (lockfile === null)
  {
    await execAsync('npm install');
    lockfile = getJSON<Lockfile>(path.join(info.root, "package-lock.json"));
  }

  Terminal.clearSession(session); // this will also create session
  let name: ReturnType<typeof getName>;
  while (true)
  {
    Terminal.clearSession();
    const input = args.flags.name ?? await Terminal.prompt("name", true);
    name = getName(input);

    if (!name) 
    {
      Terminal.write("name missing, try again");
      continue;
    }
    if (lockfile && getPackage(`${scope}/${name.name}`, lockfile))
    {

      Terminal.write("package already exists, try again")
      continue;
    }

    break;
  }

  const fullName = `${scope}/${layerConfig.LAYER_INCLUDE === "prefix" ? layerConfig.LAYER_NAME + "-" : ""}${name.name}${layerConfig.LAYER_INCLUDE === "suffix" ? "-" + layerConfig.LAYER_NAME : ""}`;
  const description = args.flags.description || await Terminal.prompt("description", true);

  Terminal.write();
  Terminal.createSession();
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
  const destination = path.join(layer, name.name);
  // Copy package template
  await copyFolder(path.join(scriptdir, "asset/package-templates", template), destination, async file => {
    const final = file
      .replace(/VARIABLE_NAME/g, name.name)
      .replace(/VARIABLE_FULL_NAME/g, fullName)
      .replace(/VARIABLE_DESCRIPTION/g, description)
      .replace(/VARIABLE_LAYER_FOLDER/g, layerBasename)
      .replace(/VARIABLE_PROJECTLICENSE/g, rootPackage.license || "MIT")
      .replace(/VARIABLE_GITHUB_REPO/g, repository)
      .replace(/VARIABLE_LOCAL_DESTINATION/g, localFolder)
      .replace(/VARIABLE_CLASS_NAME/g, name.className)
      .replace(/VARIABLE_USER/g, process.env.USER ?? "anonymous");

    return final;
  });

  await componetRunner(scriptdir, args, destination);

  Terminal.write(`${fullName} created`);

  const npminstall = args.flags.agree || args.flags.install || await Terminal.confirm("install package");
  if (npminstall)
  {
    await execAsync('npm install');
    Terminal.clearSession();
  }

  const commit = args.flags.agree || args.flags.commit || await Terminal.confirm("git commit");
  if (commit)
  {
    await execAsync(`git add `);
  }
}