import { Arguments, getPathInfo, LocalPackage, Terminal } from "@papit/cli";
import { getDocument } from "./util";
import { Document } from "@papit/html";

import path from "node:path";
import fs from "node:fs";

const SPECIAL_ICONS: Record<string, true> = {
  "d.ts": true,
  "test.js": true,
}

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

  const spritesheet_source = Arguments.get("explorer-spritesheet").at(0) ?? path.join(info.script!, "asset/icons/explorer-spritesheet.svg");
  const spritesheet_content = fs.readFileSync(spritesheet_source, { encoding: "utf-8" });
  const spritesheet_dom = new Document();
  spritesheet_dom.innerHTML = spritesheet_content;
  if (!spritesheet_dom.documentElement) 
  {
    Terminal.error("something went wrong loading explorer icon spritesheet");
    process.exit(1);
  }
  spritesheet_dom.documentElement.setAttribute("style", "display:none");

  document.body?.appendChild(spritesheet_dom.documentElement);

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
          <svg><use href="#folder" /></svg>
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
        <svg><use href="" /></svg>
        <span class="name">${name}</span>
      </a>
    `;


    const anchor = li.querySelector("a")!;
    const use = anchor.querySelector("use");

    if (!name.startsWith(".env") && !name.startsWith(".git") && name.startsWith(".")) 
    {
      li.classList.add("hidden");
    }

    if (stat.isFile())
    {
      const basename = path.basename(name);
      const split = basename.split(".");
      let ext = path.extname(name).replace(".", "");
      if (split.length === 1) ext = basename;
      else if (split.length > 2)
      {
        const potiential = split.slice(split.length - 2, split.length).join(".");
        if (SPECIAL_ICONS[potiential]) ext = potiential;
      }

      let icon = ext;
      if (basename.startsWith(".git"))
      {
        icon = "git";
      }
      else if (basename === "package.json")
      {
        icon = "package";
      }
      else if (basename.startsWith("tsconfig"))
      {
        icon = "tsconfig"
      }

      use?.setAttribute("href", "#" + icon);
      li.toggleAttribute("data-file");

      files.appendChild(li);
      return;
    }
    if (stat.isDirectory())
    {
      use?.setAttribute("href", "#folder");
      li.toggleAttribute("data-folder");

      anchor.setAttribute("href", name + "/");
      folders.appendChild(li);
    }
  });

  return document;
}
