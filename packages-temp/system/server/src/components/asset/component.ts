import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import { DEPENDENCY } from "../dependency";
import { add as addlanguage, get as getlanguage, translations } from "../language";
import { FileType } from "../file";
import { reference, FileInfo, ASSET_FOLDERS, Level, Type } from "./types";

const typereference = new Map<string, string[]>();
// route functions 
export function route(req: http.IncomingMessage, res: http.ServerResponse) {

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  let content: any = {};

  const url = req.url as string;
  if (url === "/asset/translations/") {
    content = Object.keys(translations).map(name => {
      return {
        name,
        meta: translations[name].meta
      }
    });
  }
  else if (url.startsWith("/asset/translations/")) {
    // client is asking for specific translation
    const match = url.match(/\/asset\/translations\/(\w+)\/(\w+)/)
    if (match) {
      const [_full, name, level] = match;

      const languages = reference.get("/translations/" + name + ".json");
      if (languages) {
        const find = languages.find(l => l.level === level);
        if (find) content = JSON.parse(fs.readFileSync(find.url, "utf-8") || "{}");
      }
      else {
        content = { error: `could translations under name: "${name}"` }
      }
    }
    else {
      content = { error: `your request is wrong and should follow pattern /asset/translation/<name>/<level> where level is view,package,global,dependency. You provided: ${url}` }
    }
  }
  else {
    const typematch = url.match(/\/asset\/(\w+)/);
    if (typematch) {
      const [_full, type] = typematch;
      const files = typereference.get(type);
      if (files) content = files;
      else {
        content = { error: `could not find assets by type: "${type}"` }
      }
    }
    else {
      content = Array.from(reference); // then just give all 
    }
  }
  res.end(JSON.stringify(content));
}

export function get(url: string): FileType | null | string {
  const info = reference.get(url);
  if (!info || info.length === 0) return null;

  // which one to serve ? 
  // I guess always first unless url can contain further info which one specific - until I need it though..
  const first = info[0];
  if (first.type === "translations") {
    const language = getlanguage(first.name);
    return {
      data: JSON.stringify(language),
      url,
    }
  }
  return first.url;
}

export function init() {
  // we add all asset folders ectracted by run.sh (view, package, global) [locals]
  ASSET_FOLDERS.forEach(url => extract(url));

  // then we append each dependency making sure the locals have higher priority
  for (let name in DEPENDENCY) {
    const base = path.join(process.env.ROOTDIR as string, DEPENDENCY[name].path);
    let url = path.join(base, "assets"); // attempt 
    if (fileinfo(url) !== "directory") {
      url = path.join(base, "asset"); // second attempt 
      if (fileinfo(url) !== "directory") {
        continue; // giveup 
      }
    }
    extract(url, "dependency"); // success
  }
}

function extract(url: string, level?: Level) {
  const info = fileinfo(url);
  if (info === "directory") {
    const dirents = fs.readdirSync(url, { withFileTypes: true });
    for (const dirent of dirents) {
      const direnturl = path.join(url, dirent.name);
      if (dirent.isFile()) {
        add(direnturl, level);
      }
      else if (dirent.isDirectory()) {
        extract(direnturl, level);
      }
    }
  }
  else if (info === "file") {
    add(url, level);
  }
}

const assetdir = path.join(process.env.PACKAGE as string, "asset");
function add(filepath: string, level?: Level) {
  // at this point we know filepath is a file 
  const parent = path.dirname(filepath);
  const extension = path.extname(filepath);
  const fileinfo: FileInfo = {
    filepath,
    parent,
    extension,
    parentname: parent.slice(parent.lastIndexOf("/") + 1),
    name: path.basename(filepath, extension),
  }

  const assetlocation = "/" + path.join(fileinfo.parentname, fileinfo.name + fileinfo.extension);

  if (level === undefined) {
    if (filepath.startsWith(process.env.LOCATION as string)) {
      level = "view";
    }
    else if (filepath.startsWith(assetdir)) {
      level = "package";
    }
    else if (filepath.startsWith(process.env.ROOTDIR as string)) {
      level = "global"
    }
    else {
      level = "dependency";
      if (["verbose", "debug"].includes(process.env.LOGLEVEL as string)) {
        console.log(`[warn] could not really establish asset level so ended up being dependency: "${filepath}"`);
      }
    }
  }

  let type: Type = "translations";
  if (/^translation/i.test(fileinfo.parentname)) {
    addlanguage(fileinfo);
  }
  else {
    // normal asset file like icon etc 
    if (/^icon/i.test(fileinfo.parentname)) {
      type = "icons";
    }
    else if (/^image/i.test(fileinfo.parentname)) {
      type = "images";
    }
    else {
      type = "others";
    }
  }

  const locations = reference.get(assetlocation) || [];
  locations.push({ level, type, url: filepath, name: fileinfo.name });
  reference.set(assetlocation, locations);

  const types = typereference.get(type) || [];
  types.push(filepath);
  typereference.set(type, types);
}
export function fileinfo(url: string): "file" | "directory" | undefined {
  try {
    const stat = fs.statSync(url);
    if (stat.isFile()) return "file";
    if (stat.isDirectory()) return "directory";
    return undefined;
  }
  catch {
    return undefined;
  }
}