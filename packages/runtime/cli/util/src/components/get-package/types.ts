
type BasePackage = {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  license?: string;
  repository?: {
    type: "git" | (string & {});
    url: string;
  };

  scripts?: Record<string, string>;
  bin?: Record<string, string>;
  main?: string;
  types?: string;
  type: "module" | "commonjs";
  entryPoints?: string|Record<string,string>;
  exports?: Record<"." | (string & {}), Partial<Record<"import" | "types" | "require" | (string & {}), string>>>;
}

export type RootPackage = BasePackage & {
  papit: {
    layers: Record<string, { name: string; include: false|"prefix"|"suffix"; }>;
    htmlprefix?: string;
  };
}

export type LocalPackage = BasePackage & {
  papit: {
    publish: boolean;
    type: string;
    main: {name: string; className: string};
    components: Record<string, {className: string}>;
    htmlprefix?: string;
  };
}

export type Package = RootPackage | LocalPackage;

type PackageLockEntry = {
  link: boolean;
  resolved: string;
  name?: string;
};
export type Lockfile = {
  packages: Record<string, PackageLockEntry | Package>;
}