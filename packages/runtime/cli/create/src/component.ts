#!/usr/bin/env node

import { Terminal } from "@papit/cli-util"
import { runner as packageRunner } from "./components/package";
import { runner as componentRunner } from "./components/component";

(async function () {
  Terminal.createSession();
  const option = await Terminal.option(["package", "component", "project", "showcase"]);
  Terminal.clearSession();

  switch (option)
  {
    case 1:
      return componentRunner();
    default:
      return packageRunner();
  }
}())
