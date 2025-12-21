export type Package = {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  license?: string;
  repository: {
    type: "git" | (string & {});
    url: string;
  };

  bin?: Record<string, string>;
  main?: string;
  types?: string;
  type: "module" | "commonjs";
  exports?: Record<"." | (string & {}), Partial<Record<"import" | "types" | "require" | (string & {}), string>>>;
  entryPoints?: string|Record<string,string>;
}

type PackageLockEntry = {
  link: boolean;
  resolved: string;
};
export type Lockfile = {
  packages: Record<string, PackageLockEntry | Package>;
}