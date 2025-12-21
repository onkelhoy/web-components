export type FileInfo = {
  name: string;
  parent: string;
  filepath: string;
  parentname: string;
  extension: string;
}

export type Level = "view" | "global" | "package" | "dependency";
export type Type = "icons" | "images" | "translations" | "others";
type Location = {
  level: Level;
  type: Type;
  url: string;
  name: string;
}

// variables
export const ASSET_FOLDERS = (process.env.ASSET_DIRS || "").split(' ');
export const reference = new Map<string, Location[]>();