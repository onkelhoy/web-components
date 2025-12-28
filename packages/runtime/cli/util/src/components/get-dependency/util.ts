import path from 'node:path';

import { getScope } from "../get-scope";
import { Lockfile, RemotePackages, } from "../get-package";
import { getJSON } from '../get-json';
import { Terminal } from '../terminal';
import { getPathInfo } from "../../util";


export type MinimalMap = { 
  changedversion?: boolean; 
  location?: string; 
  version?: string; 
  remoteversion?: string;
  dep: string[]; 
  has: string[]; 
}
export type Config = {
  info: ReturnType<typeof getPathInfo>;
  scope: ReturnType<typeof getScope>;
  lockfile: Lockfile;
  acceptance?: Set<string>;
  data?: { map: Record<string, MinimalMap>, set: Set<string> }
  remotePackages?: RemotePackages|null;
};

export type Batch = {
  name: string;
  location: string | undefined;
  changedversion: boolean | undefined;
  version: string | undefined;
  remoteversion: string | undefined;
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

  return { ...config, info, scope, lockfile };
}