import { Meta } from "./language.type";

export type ASSET_TYPE = "icons" | "translations" | "images" | "themes" | "unknown";
export type ASSET_OBJECT = {
  asset_type: ASSET_TYPE;
  package_type: string;
  name: string;
  meta: undefined | Meta;
  dependency_name: string | undefined;
  path: string;
  fullpath: string;
}
// Record<string, ASSET_OBJECT[]> & 
export type IASSETS = {
  map: Record<string, ASSET_OBJECT[]>;
  __references: Record<ASSET_TYPE, Record<string, boolean>>;
};

// TRANSLATION
