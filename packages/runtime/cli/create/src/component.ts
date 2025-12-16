#!/usr/bin/env node

import { Terminal } from "@papit/cli-util"
import { runner as packageRunner } from "./components/package";

(async function () {
  Terminal.createSession();
  const option = await Terminal.option(["package", "component", "project", "showcase"]);
  Terminal.clearSession();

  switch (option)
  {
    default:
      packageRunner();
  }
}())
