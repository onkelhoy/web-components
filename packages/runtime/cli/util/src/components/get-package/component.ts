import { getScope } from "../get-scope";
import { Lockfile, Package } from "./types";

export function getPackage<T extends Package>(fullPackageName: string, lockfile: Lockfile): T | null {
  if (!lockfile) return null;

  const linkedPackage = lockfile.packages[`node_modules/${fullPackageName}`];
  if (!linkedPackage) return null;
  if (!('link' in linkedPackage)) throw Error("requested package is not local");

  return lockfile.packages[linkedPackage.resolved] as T;
}

export async function getRemotePackages(scope: string = getScope(), size: number = 100): Promise<any> {
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${scope}&size=${size}`)
    if (!res.ok) return null;

    const json = await res.json();
    console.log("json", json);
  }
  catch 
  {
    return null;
  }
}

export async function getRemotePackage(packageName: string): Promise<any> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
    if (!res.ok) return null;
  
    const json = await res.json();
    console.log("json", json);
  }
  catch 
  {
    return null;
  }
}