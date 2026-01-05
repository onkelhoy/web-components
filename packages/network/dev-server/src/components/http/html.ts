import fs from "node:fs";
import path from "node:path";
import { Document } from "@papit/html";
import { Arguments, getPathInfo, LocalPackage, Terminal } from "@papit/util-cli";
import { getFile } from "../asset/stream-file";

export async function getHTML(
  info: ReturnType<typeof getPathInfo>,
  assets: Record<string, string[]>,
  packageJSON: LocalPackage,
  FFs: string[],
  currentURL: string,
) {
  const baseDOM = new Document();
  let baseTemplateSource = path.join(info.script!, "asset/templates/base.html");
  if (typeof Arguments.args.flags['base-template'] === "string" && fs.existsSync(Arguments.args.flags['base-template']))
  {
    baseTemplateSource = Arguments.args.flags['base-template'];
  }

  if (!fs.existsSync(baseTemplateSource))
  {
    console.log(info.script);
    Terminal.error("could not find base template html file");
    process.exit(1);
  }

  const content = fs.readFileSync(baseTemplateSource, { encoding: "utf-8" });
  baseDOM.innerHTML = content;

  // const htmlFiles = FFs
  //   .filter(name => name.endsWith(".html"))
  //   .sort((a, b) => {
  //     if (a.startsWith("index")) return 1;
  //     return a.localeCompare(b);
  //   });
    
  // if (htmlFiles.length > 0)
  // {
  //   const dom = new Document();
  //   const content = fs.readFileSync(path.join(currentURL, htmlFiles[0]), { encoding: "utf-8" });
  //   dom.innerHTML = content;

  //   if (dom.body) 
  //   {
  //     baseDOM.body!.innerHTML = dom.body.innerHTML;
  //   }

  //   // if (dom.querySelector())
  //   // if 

  //   // let html!: Element;
  //   // let head!: Element;

  //   // if (!dom.querySelector("html"))
  //   // { 
  //   //   html = dom.createElement("html");
  //   //   html.innerHTML = content;
  //   //   dom.innerHTML = html.outerHTML;
  //   // }

  //   // if (!dom.querySelector("head"))
  //   // {
  //   //   head = dom.createElement("head");
  //   //   head.innerHTML = `
  //   //     <meta />
  //   //     <meta /> 
  //   //     <link data-theme rel="stylesheet" href="" />
  //   //     <title>${packageJSON.name}</title>
  //   //   `
  //   //   html.appendChild(head);
  //   // }
  //   // if (!head.querySelector("style[data-theme]"))
  //   // {
  //   //   const theme = dom.createElement("link");
  //   //   // theme.attributes['data-theme'] = true;
  //   //   // theme.attributes[]
  //   // }
  //   // if (head.querySelector)
  // }
  // else 
  constructExplorer(baseDOM, assets, info, packageJSON, FFs, currentURL);

  return baseDOM;
}

function mergeDocuments(base: Document, html: Document) {

}
function constructExplorer(
  document: Document,
  assets: Record<string, string[]>,
  info: ReturnType<typeof getPathInfo>,
  packageJSON: LocalPackage,
  FFs: string[],
  currentURL: string,
) {
  if (typeof packageJSON.name === "string")
  {
    document.title = packageJSON.name
  }

  if (info.local !== info.package)
  {
    document.title = `${document.title} ${path.dirname(info.local)}`
  }

  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", "/templates/explorer.css");
  document.head?.appendChild(link);

  const folders = document.createElement("ul");
  const files = document.createElement("ul");

  if (path.relative(info.package, currentURL) !== "")
  {
    folders.innerHTML = `
      <li class="hidden">
        <a href="..">
          <span class="icon-wrapper">${getIcon("folder", "..", assets)}</span>
          <span class="name">..</span>
        </a>
      </li>
    `;
  }
  
  FFs.sort((a, b) => a.localeCompare(b)).forEach(name => {
    const url = path.join(currentURL, name);
    const stat = fs.statSync(url);
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${name}">
        <span class="icon-wrapper" />
        <span class="name">${name}</span>
      </a>
    `

    const anchor = li.querySelector("a")!;
    const iconspan = anchor.querySelector("span.icon-wrapper")!;

    if (!name.startsWith(".env") && !name.startsWith(".git") && name.startsWith(".")) 
    {
      li.classList.add("hidden");
    }
    
    if (stat.isFile())
    {
      iconspan.innerHTML = getIcon(name, name, assets);
      li.toggleAttribute("data-file")
      
      files.appendChild(li);
      return;
    }
    if (stat.isDirectory())
    {
      iconspan.innerHTML = getIcon("folder", name, assets);
      li.toggleAttribute("data-folder")

      anchor.setAttribute("href", name + "/");
      folders.appendChild(li);
    }
  });


  document.body?.appendChild(folders)
  document.body?.appendChild(files)
}

// , assets: Record<string, string
// const extname = path.extname(name);

const fallbackIcons:Record<string, string> = {
  folder: "FOL",
  temp: "TMP",
  gitignore: "GIT",
  gitkeep: "GIT",
  "d.ts": "dTS",
  json: "{}",
  md: "MD",
  html: "</>", // dont think this will even be shown as it should render it
}

function getIcon(name: string, original: string, assets: Record<string, string[]>) {
  const split = original.split(".");
  split.shift();
  const shift1 = split.join(".");
  split.shift();
  const shift2 = split.join(".");

  const arr = [original, shift1, shift2, name];
  for (const item of arr)
  {
    if (!item) continue;

    const url = `/icons/${item}.svg`;
    if (assets[url])
    {
      const copy = [...assets[url]];
      while (copy.length > 0)
      {
        const icon = getFile(copy.pop()!, url);
        if (icon.data) return icon.data.content.toString("utf-8");
      }
    }

    if (fallbackIcons[item]) return `<span class="icon">${fallbackIcons[item]}</span>`;
  }
  
  return `<span class="icon">${name.slice(0, 3).toUpperCase()}</span>`;
}