import { getPathInfo, LocalPackage } from "@papit/util-cli";
import { getDocument } from "./util";
import { Document } from "@papit/html";

import path from "node:path";
import fs from "node:fs";
import { getFile } from "../asset/stream-file";

export function createExplorer(
  assets: Record<string, string[]>,
  info: ReturnType<typeof getPathInfo>,
  packageJSON: LocalPackage,
  FFs: string[],
  currentURL: string,
) {
  const document = getDocument("explorer", info);

  if (typeof packageJSON.name === "string")
  {
    document.title = packageJSON.name
  }

  if (info.local !== info.package)
  {
    document.title = `${document.title} ${path.dirname(info.local)}`
  }
  
  // NOTE nt step is to make sire the "data-location" shou
  const location = document.querySelector("[data-location]")!;
  const relative = path.relative(info.package, currentURL);
  if (relative) location.innerHTML = relative
  else location.parentElement?.removeChild(location);


  const folders = document.querySelector("ul[data-folders]")!;
  const files = document.querySelector("ul[data-files]")!;

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

  return document;
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