import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import {
  Terminal,
  getPackageInfo,
  getConfig,
  getArguments,
  getName,
  copyFolder,
} from "@papit/cli-util"
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
export async function componentRunner(scriptdir: string, args: ReturnType<typeof getArguments>, packageInfo?: PackageInfo) {

  const info = getPackageInfo(packageInfo?.destination);
  const packageConfigLocation = path.join(info.local, ".config");
  const config = getConfig(packageConfigLocation);

  if (config == null)
  {
    Terminal.error("could not find package's .config file");
    process.exit(1);
  }

  if (!config.FULL_NAME)
  {
    Terminal.error("package is missing FULL_NAME in .config");
    process.exit(1);
  }

  const templates = getFolders(path.join(scriptdir, "asset/component-templates"));
  let templateIndex = templates.findIndex(f => f === config.TEMPLATE_TYPE);

  if (templateIndex < 0)
  {
    const argType = args.flags.component ?? args.flags.type;
    templateIndex = templates.findIndex(f => f === argType);

    if (templateIndex < 0)
    {
      Terminal.createSession();
      Terminal.write("type of component");
      templateIndex = await Terminal.option(templates);
      Terminal.clearSession();
    }
  }
  const template = templates[templateIndex]

  const rootConfig = getConfig(path.join(info.root, ".config"));

  let htmlPrefix:string|undefined = undefined;
  if (Array.isArray(args.flags['html-prefix'])) htmlPrefix = args.flags['html-prefix'].join("-");
  else if (typeof args.flags['html-prefix'] === "string") htmlPrefix = args.flags['html-prefix'];
  else htmlPrefix = packageInfo?.htmlPrefix ?? config.HTML_PREFIX

  if (htmlPrefix?.trim() === "") htmlPrefix = undefined;

  if (htmlPrefix === undefined && /web-components?/i.test(template))
  {
    if (htmlPrefix === undefined) htmlPrefix = rootConfig?.HTML_PREFIX;

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
    if (Array.isArray(args.flags.name)) input = args.flags.name.join(" ");
    else if (typeof args.flags.name === "string") input = args.flags.name;
    else input = await Terminal.prompt("(package) name", true);

    nameInfo = getName(input);

    if (!nameInfo) 
    {
      Terminal.write("name missing, try again");
      continue;
    }

    if (config["COMPONENT_"+nameInfo.name])
    {
      Terminal.write("name already exist, try again");
      continue;
    }

    break;
  }

  const inlineCopy = (src: string, dest: string) => 
    copyFolder(src, dest, file => {
      return file
        .replace(/VARIABLE_NAME/g, nameInfo.name)
        .replace(/VARIABLE_FULL_NAME/g, config.FULL_NAME!)
        .replace(/VARIABLE_HTML_NAME/g, `${htmlPrefix}-${nameInfo.name}`)
        .replace(/VARIABLE_CLASS_NAME/g, nameInfo.className)
    });
  
  Terminal.createSession();
  const shouldCommit = packageInfo?.shouldCommit === undefined ? ('agree' in args.flags || 'commit' in args.flags || await Terminal.confirm("git commit", true)) : packageInfo.shouldCommit;
  Terminal.clearSession();

  const templateSrc = path.join(scriptdir, "asset/component-templates", template);
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
        // should be injected into src/index.ts & updated in .config and maybe README.md ? 
        if (!config["COMMENT_Components"])
        {
          fs.appendFileSync(packageConfigLocation, "\n# Components\n");
        }
  
        // inject into .config
        fs.appendFileSync(packageConfigLocation, `COMPONENT_${nameInfo.name}\n`);

        if (shouldCommit)
        {
          try 
          {
            await execAsync(`git add ${packageConfigLocation}`);
          }
          catch 
          {
            Terminal.warn(`"git add ${packageConfigLocation}" failed`);
          }
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
    await inlineCopy(templateFolderSrc, dest);
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