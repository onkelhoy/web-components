#!/usr/bin/env node

import { getScriptScope, Terminal } from "@papit/cli-util"
import { runner as packageRunner } from "./components/package";
import { runner as componentRunner } from "./components/component";

(async function () {
  const scriptdir = getScriptScope(import.meta.url);
  if (!scriptdir)
  {
    Terminal.error("could not find @papit/create");
    process.exit();
  }

  Terminal.write()
  Terminal.write("@papit - create");
  
  Terminal.createSession();
  const option = await Terminal.option(["package", "component", "project", "showcase"]);
  Terminal.clearSession();

  switch (option)
  {
    case 1:
      await componentRunner(scriptdir);
      break;
    default:
      await packageRunner(scriptdir);
      break;
  }

  process.exit();
}())
