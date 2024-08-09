// imports 
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { parse, HTMLElement } from "node-html-parser";
// local 
import { TYPES, TEMPLATE } from './html.type';


// variable
const templates: Record<TYPES, TEMPLATE> = {
  common: {
    file: null,
  },
  live: {
    file: null,
    process: (file) => {
      return file.replace("PLACEHOLDER_PORT", process.env.PORT as string);
    }
  },
  notfound: {
    file: null,
    process: (file) => {
      return file.replace("PLACEHOLDER_NAME", process.env.NAME || "@papit/server");
    }
  },
  directory: {
    file: null,
  },
  wrapper: {
    file: null,
  },
}

export function route(req: http.IncomingMessage, res: http.ServerResponse) {
  let filepath = req.url as string;
  if (!filepath.endsWith(".html")) {
    if (!filepath.endsWith("/")) filepath += "/"
    filepath += "index.html";
  }

  let document: null | HTMLElement = null;

  try {
    const source = fs.readFileSync(path.join(process.env.LOCATION as string, filepath), 'utf-8');
    document = processDocument(parse(source));
  }
  catch (error) {
    const url = path.join(process.env.LOCATION as string, req.url as string);
    if (fs.existsSync(url)) {
      document = processDocument(get("directory"));
      const listelment = document.querySelector('#list');
      if (listelment) listelment.innerHTML = "";

      const files: string[] = [];
      const directories: string[] = [];
      fs.readdirSync(url, {
        withFileTypes: true,
      }).forEach(dirent => {
        if (dirent.name !== ".temp") {
          if (dirent.isDirectory()) directories.push(dirent.name);
          else files.push(dirent.name);
        }
      });

      if (!(req.url === "" || req.url === "/")) {
        listelment?.appendChild(parse(`<li><span>🗂️</span><a href="${path.dirname(req.url as string)}">..</a></li>`));
      }

      directories.forEach(dir => {
        listelment?.appendChild(parse(`<li><span>🗂️</span><a href="${path.join(req.url || '/', dir)}">${dir}/</a></li>`));
      });
      files.forEach(file => {
        listelment?.appendChild(parse(`<li><span>📄</span><a href="${path.join(req.url || '/', file)}">${file}</a></li>`));
      });
    }
    else {
      document = processDocument(get("notfound"));
    }
  }

  if (document !== null) {
    const file = document.toString();
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(file);
  }
  else {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "something went wrong getting HTML file" }));

    if (process.env.LOGLEVEL as string !== "none") {
      console.log("\x1b[31m[error] something went wrong on server processing document\x1b[0m")
    }
  }
}

// helper functions

function get(type: TYPES): HTMLElement {
  let htmllocation = process.env[type.toUpperCase()];
  if (typeof htmllocation !== "string" || !fs.existsSync(htmllocation)) {
    htmllocation = path.join(process.env.SCRIPTDIR as string, `template/${type}.html`);
  }

  if (!templates[type].file) {
    let file = fs.readFileSync(htmllocation as string, 'utf-8');

    if (templates[type].process) {
      file = templates[type].process(file);
    }

    templates[type].file = parse(file);
  }

  return templates[type].file;
}
function processDocument(document: HTMLElement) {
  if (process.env.LIVE) {
    document.querySelector('head')?.appendChild(get("live"));
  }

  document.querySelector('head')?.appendChild(get("common"));
  return document
}