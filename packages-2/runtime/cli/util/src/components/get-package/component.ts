import { Lockfile, Package } from "./types";

export function getPackage(fullPackageName: string, lockfile: Lockfile): Package|null {
  if (!lockfile) return null;

  const linkedPackage = lockfile.packages[`node_modules/${fullPackageName}`];
  if (!linkedPackage) return null;
  if (!('link' in linkedPackage)) throw Error("requested package is not local");

  return lockfile.packages[linkedPackage.resolved] as Package;
}