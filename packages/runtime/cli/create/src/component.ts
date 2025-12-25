
import path from "node:path";
import fs from "node:fs";

import { getArguments, getPathInfo, Terminal } from "@papit/util-cli"
import { packageRunner } from "./components/runners/package";
import { componentRunner } from "./components/runners/component";
import { getFolders } from "components/util";

(async function () {
  const args = getArguments(["verbose", "install", "commit", "agree"]);
  const info = getPathInfo(undefined, import.meta.url);

  if (args.flags.verbose)
  {
    process.env.verbose = "true";
  }

  if (!info.script)
  {
    Terminal.error("could not find @papit/create");
    process.exit(1);
  }

  if (!process.env.USER)
  {
    Terminal.createSession();
    process.env.USER = await Terminal.prompt("your name", true);
    Terminal.clearSession();
  }

  Terminal.write();
  Terminal.write("@papit/create - running");
  Terminal.write();

  const options = ["package", "component", "project", "showcase"];

  const localRunnersLocation = path.join(info.root, "bin/runners");
  const folders = getFolders(localRunnersLocation);
  const localRunnerSet = new Set<string>();
  folders.forEach(folder => {
    if (options.includes(folder)) return;

    const runnerFile = path.join(localRunnersLocation, folder, "runner.js");
    if (!fs.existsSync(runnerFile)) return;

    localRunnerSet.add(folder);
    options.push(folder);
  })
  

  let option: number|null = null;
  for (let i=0; i<options.length; i++)
  {
    if (args.flags[options[i]]) 
    {
      option = i;
      break;
    }
  }
  
  if (option === null)
  {
    Terminal.createSession();
    option = await Terminal.option(options);
    Terminal.clearSession();
  }

  switch (option)
  {
    case 0:
      await packageRunner(info, args);
      break;
    case 1:
      await componentRunner(info, args);
      break;
    default: {
      const runnerName = options[option];
      if (!localRunnerSet.has(runnerName))
      {
        Terminal.error("requested a runner that doesnt exist");
        process.exit(1);
      }

      const runnerFile = path.join(localRunnersLocation, runnerName, "runner.js");

      if (args.flags.verbose)
      {
        Terminal.write(`running local runner "${runnerName}"`);
      }
      
      const { default: runner } = await import(runnerFile);
      await runner(info, args)
      break;
    }
  }

  process.exit();
}())