import path from 'node:path';

import { getScope } from "../get-scope";
import { getArguments } from "../get-arguments";
import { Lockfile, } from "../get-package";
import { getJSON } from '../get-json';
import { Terminal } from '../terminal';
import { getPathInfo } from "../../util";

export type Config = {
  info: ReturnType<typeof getPathInfo>;
  args: ReturnType<typeof getArguments>;
  scope: ReturnType<typeof getScope>;
  lockfile: Lockfile;
  acceptance?: Set<string>;
};

export type Batch = {
  name: string;
  location: string | undefined;
  version: string | undefined;
  changedversion: boolean | undefined;
}

export function getBasicConfig(
  config: Partial<Config> = {}
): Config {
  const info = config.info ?? getPathInfo();
  const scope = config.scope ?? getScope();
  const args = config.args ?? getArguments(["verbose"]);
  const lockfile = config.lockfile ?? getJSON<Lockfile>(path.join(info.root, "package-lock.json"));

  if (!lockfile) 
  {
    Terminal.error("lockfile not found");
    process.exit(1);
  }

  return { info, scope, args, lockfile, acceptance: config.acceptance };
}