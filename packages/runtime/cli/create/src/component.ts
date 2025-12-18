#!/usr/bin/env node

import { getArguments, getScriptScope, Terminal } from "@papit/cli-util"
import { packageRunner } from "components/runners/package";
import { componentRunner } from "components/runners/component";

(async function () {
  const args = getArguments(["verbose", "install", "commit", "agree"]);
  if ('verbose' in args.flags)
  {
    process.env.verbose = "true";
  }
  const scriptdir = getScriptScope(import.meta.url);
  if (!scriptdir)
  {
    Terminal.error("could not find @papit/create");
    process.exit();
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

  Terminal.createSession();
  const option = await Terminal.option(["package", "component", "project", "showcase"]);
  Terminal.clearSession();

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