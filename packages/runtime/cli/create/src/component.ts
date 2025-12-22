#!/usr/bin/env node

import { getArguments, getScriptScope, Terminal } from "@papit/cli-util"
import { packageRunner } from "components/runners/package";
import { componentRunner } from "components/runners/component";

(async function () {
  const args = getArguments(["verbose", "install", "commit", "agree"]);
  if (args.flags.verbose)
  {
    process.env.verbose = "true";
  }
  const scriptdir = getScriptScope(import.meta.url);
  if (!scriptdir)
  {
    if (args.flags.verbose)
    {
      console.log("import.meta.url", import.meta.url);
    }
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

  let option = 0;
  if (args.flags.package)
  {
    option = 0;
  }
  else if (args.flags.component)
  {
    option = 1;
  }
  else if (args.flags.project)
  {
    option = 2;
  }
  else if (args.flags.showcase)
  {
    option = 3;
  }
  else 
  {
    Terminal.createSession();
    option = await Terminal.option(["package", "component", "project", "showcase"]);
    Terminal.clearSession();
  }

  switch (option)
  {
    case 1:
      await componentRunner(scriptdir, args);
      break;
    default:
      await packageRunner(scriptdir, args);
      break;
  }

  process.exit();
}())