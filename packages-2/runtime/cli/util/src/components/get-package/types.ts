export type Package = {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  license: string;
}

type PackageLockEntry = {
  link: boolean;
  resolved: string;
};
export type Lockfile = {
  packages: Record<string, PackageLockEntry|Package>;
}