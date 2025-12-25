import path from 'node:path';

import { getScope } from "../get-scope";
import { Lockfile, } from "../get-package";
import { getJSON } from '../get-json';
import { Terminal } from '../terminal';
import { getPathInfo } from "../../util";

export type Config = {
  info: ReturnType<typeof getPathInfo>;
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
  const lockfile = config.lockfile ?? getJSON<Lockfile>(path.join(info.root, "package-lock.json"));

  if (!lockfile) 
  {
    Terminal.error("lockfile not found");
    process.exit(1);
  }

  return { info, scope, lockfile, acceptance: config.acceptance };
}