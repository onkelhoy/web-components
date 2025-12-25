import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import {
  Terminal,
  getName,
  copyFolder,
  getPathInfo,
  getJSON,
  RootPackage,
  LocalPackage,
  Arguments,
} from "@papit/util-cli"
import { getFolders } from "components/util";

type PackageInfo = {
  destination: string;
  nameInfo: ReturnType<typeof getName>;
  htmlPrefix?: string;
  shouldCommit: boolean;
}

function folderHasFilesSync(path: string): boolean {
  try {
    return fs.readdirSync(path).length > 0;
  } catch {
    return false;
  }
}
function createFolderIfNotExistSync(url:string) {
  if (!(fs.existsSync(url) && fs.statSync(url).isDirectory()))
  {
    fs.mkdirSync(url);
  }
}

const execAsync = promisify(exec);
export async function componentRunner(
  _info: ReturnType<typeof getPathInfo>,
  packageInfo?: PackageInfo,
  rootPackage?: RootPackage,
) {

  const info = getPathInfo(packageInfo?.destination);

  if (!rootPackage) rootPackage = getJSON<RootPackage>(path.join(info.root, "package.json")) ?? undefined;
  if (!rootPackage)
  {
    Terminal.error("could not find root package.json file");
    process.exit(1);
  }

  const packageJSONLocation = path.join(info.local, "package.json");
  const localPackage = getJSON<LocalPackage>(packageJSONLocation)

  if (localPackage == null)
  {
    Terminal.error("could not find package's package.json file");
    process.exit(1);
  }

  const templateFolders = getFolders(path.join(_info.script!, "asset/component-templates"));
  const localRunnerSet = new Set<string>();
  getFolders(path.join(info.root, "bin/runners/component"))
    .forEach(f => {
      templateFolders.push(f);
      localRunnerSet.add(f);
    });

  let templateIndex = templateFolders.findIndex(f => f === localPackage.papit?.type);

  if (templateIndex < 0)
  {
    const argType = Arguments.args.flags.component ?? Arguments.args.flags.type;
    templateIndex = templateFolders.findIndex(f => f === argType);

    if (templateIndex < 0)
    {
      Terminal.createSession();
      Terminal.write("type of component");
      templateIndex = await Terminal.option(templateFolders);
      Terminal.clearSession();
    }
  }
  const template = templateFolders[templateIndex]

  let htmlPrefix:string|undefined = undefined;
  if (Array.isArray(Arguments.args.flags['html-prefix'])) htmlPrefix = Arguments.args.flags['html-prefix'].join("-");
  else if (typeof Arguments.args.flags['html-prefix'] === "string") htmlPrefix = Arguments.args.flags['html-prefix'];
  else htmlPrefix = packageInfo?.htmlPrefix ?? rootPackage.papit.htmlprefix;

  if (htmlPrefix?.trim() === "") htmlPrefix = undefined;

  if (htmlPrefix === undefined && /web-components?/i.test(template))
  {
    if (htmlPrefix === undefined) htmlPrefix = localPackage.papit.htmlprefix;

    const sess = Terminal.createSession();
    while (true)
    {
      let answer:string;
      if (htmlPrefix !== undefined)
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
        Terminal.write("you must use a html-prefix for web-components")
      }
    }
    Terminal.clearSession(sess);
  }

  let nameInfo: ReturnType<typeof getName> = packageInfo?.nameInfo;
  while (!nameInfo)
  {
    Terminal.clearSession();

    let input:string|undefined = undefined;
    if (Array.isArray(Arguments.args.flags.name)) input = Arguments.args.flags.name.join(" ");
    else if (typeof Arguments.args.flags.name === "string") input = Arguments.args.flags.name;
    else input = await Terminal.prompt("(package) name", true);

    nameInfo = getName(input);

    if (!nameInfo)
    {
      Terminal.write("name missing, try again");
      continue;
    }

    if (localPackage.papit.components[nameInfo.name])
    {
      Terminal.write("name already exist, try again");
      continue;
    }

    break;
  }

  Terminal.createSession();
  const shouldCommit = packageInfo?.shouldCommit === undefined ? ('agree' in Arguments.args.flags || 'commit' in Arguments.args.flags || await Terminal.confirm("git commit", true)) : packageInfo.shouldCommit;
  Terminal.clearSession();

  const templateSrc = localRunnerSet.has(template) ? path.join(info.root, "bin/runners/component", template) : path.join(_info.script!, "asset/component-templates", template);
  const folders = getFolders(templateSrc)
  for (const folder of folders)
  {
    let destParent = path.join(info.local, folder);
    let dest = destParent;
    const templateFolderSrc = path.join(templateSrc, folder);

    if (folder === "src")
    {
      if (folderHasFilesSync(destParent))
      {
        // inject into .config
        localPackage.papit.components[nameInfo.name] = {
          className: nameInfo.className,
        }

        if (shouldCommit)
        {
          await execAsync(`git add ${packageJSONLocation}`);
        }

        destParent = path.join(destParent, "components");
      }
      // else -> we keep dest as destParent
    }
    else
    {
      dest = path.join(destParent, nameInfo.name);
    }

    createFolderIfNotExistSync(destParent);

    await copyFolder(templateFolderSrc, dest, file => {
      return file
        .replace(/VARIABLE_NAME/g, nameInfo.name)
        .replace(/VARIABLE_FULL_NAME/g, localPackage.name)
        .replace(/VARIABLE_HTML_NAME/g, `${htmlPrefix}-${nameInfo.name}`)
        .replace(/VARIABLE_CLASS_NAME/g, nameInfo.className)
    });

    if (shouldCommit)
    {
      try
      {
        await execAsync(`git add ${dest}`);
      }
      catch
      {
        Terminal.warn(`"git add ${dest}" failed`);
      }
    }
  }

  // its not in package -> component mode
  if (!packageInfo?.shouldCommit && shouldCommit)
  {
    await execAsync(`git commit -m "add: ${nameInfo.name} component"`);
  }
}