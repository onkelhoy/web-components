// imports 
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { parse, HTMLElement } from "node-html-parser";
// local 
import { TYPES, TEMPLATE } from "./types";
import { DEPENDENCY } from "../dependency";

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
  importmap: {
    file: null,
    process: () => {
      const dependencies: string[] = [];

      // DOES NOT WORK.. path needs to be relative from where currently is serving from. 
      // since we cannot "go back" I think we need to copy node_modules to .temp - 
      // so lets focus on this another time 
      for (let dep in DEPENDENCY) {
        dependencies.push(`"${dep}": "${DEPENDENCY[dep].path}"`);
      }

      return `
        <script type="importmap">
          {
            "imports": {
              ${dependencies.join(",")}
            }
          } 
        </script>
      `
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
  let status = 200;

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
      status = 404;
    }
  }

  if (document !== null) {
    const file = document.toString();
    res.statusCode = status;
    res.setHeader("Content-Type", "text/html");
    res.end(file);
  }
  else {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "something went wrong getting HTML file" }));

    if (process.env.LOGLEVEL as string !== "none") {
      console.log("[error] something went wrong on server processing document")
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
    let file = null;
    if (htmllocation && fs.existsSync(htmllocation)) file = fs.readFileSync(htmllocation as string, 'utf-8');

    if (templates[type].process) {
      file = templates[type].process(file || "");
    }

    templates[type].file = parse(file as string);
  }

  return templates[type].file;
}
function processDocument(document: HTMLElement) {
  const head = document.querySelector('head');
  if (!head) return document;

  // head.appendChild(get("importmap")); TODO: goal to include
  if (process.env.LIVE) {
    head.appendChild(get("live"));
  }

  head.appendChild(get("common"));
  return document
}