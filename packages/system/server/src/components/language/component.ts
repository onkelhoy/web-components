import fs from "node:fs";
import path from "node:path";

import { Language, OBJ } from "./types";
import { FileInfo } from "../asset";

// language-type, language-data (example: en-US, {}) 
export const translations: Record<string, Language> = {};

export function add(file: FileInfo) {
  try {
    const content = fs.readFileSync(file.filepath, "utf-8");
    if (!content) {
      if (["verbose", "debug"].includes(process.env.LOGLEVEL as string)) {
        console.log("[warn] could not find any content", file);
      }
      return;
    }
    const json = JSON.parse(content);
    translations[file.name] = DeepMerge(translations[file.name] || {}, json);
  }
  catch (e) {
    if (process.env.LOGLEVEL !== "none") {
      console.log("[error] something went wrong reading translation", file);
    }
  }
}
export function save(location: string) { // this can be used to output all translations to destination folder 
  for (let key in translations) {
    const data = JSON.stringify(translations[key]);
    fs.writeFileSync(path.join(location, key + ".json"), data);
  }
}
export function get(url: string) {
  const language = translations[url];
  if (language) return language;
  return null;
}
function DeepMerge(a: OBJ, b: OBJ) {
  const output = {};
  DeepMergeReqursive(a, b, output);

  return output;
}
function DeepMergeReqursive(a: OBJ, b: OBJ, output: OBJ) {
  // we first apply from B to output 
  DeepMergeFromTo(b, a, output);

  // then we apply from A so A has priority over B 
  DeepMergeFromTo(a, b, output);
}
function DeepMergeFromTo(a: OBJ, b: OBJ, output: OBJ) {
  for (let key in a) {
    if (!b[key]) {
      output[key] = a[key];
    }
    else {
      // b has so we need to merge them 
      let atype = typeof a[key];
      let btype = typeof b[key];

      if (atype !== btype) {
        if (process.env.LOGLEVEL !== "none") {
          console.log(`[error]: type missmatch between ${a[key]} ${b[key]}`);
          return;
        }
      }

      if (["string", "boolean", "number"].includes(atype)) {
        output[key] = a[key];
      }
      else if (atype === "object") {
        output[key] = {};
        DeepMergeReqursive(a[key], b[key], output[key]);
      }
    }
  }
}