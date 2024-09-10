export type IDEPENDENCY = { path: string; package: object; }
export type ICallback = (name: string, package_path: string, dependency?: IDEPENDENCY) => void;
