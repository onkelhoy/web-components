import path from "node:path";
import fs from "node:fs";
import { Document, Element, Node } from "@papit/html";
import { getPathInfo, Terminal } from "@papit/util";

import { getDocument } from "./util";
import { Cache } from "../file/cache";
import { getURL } from "../http/url";

export function createInline(
  url: ReturnType<typeof getURL>,
  info: ReturnType<typeof getPathInfo>,
  cache: Cache,
) {
  const document = getDocument("live", info)
  if (!document.body) 
  {
    Terminal.error("live document template is missing body");
    process.exit(1);
  }

  if (!document.head) 
  {
    Terminal.error("live document template is missing head");
    process.exit(1);
  }

  const sourceDocument = new Document();
  const cached = cache.get(url);
  if (cached)
  {
    sourceDocument.innerHTML = cached.buffer.toString("utf-8");
  }
  else 
  {
    const source = fs.readFileSync(url.absolute);
    cache.add(url, source);
    sourceDocument.innerHTML = source.toString("utf-8");
  }

  if (sourceDocument.head)
  {
    sourceDocument.head.childNodes.forEach(node => appendNode(node, document.head!));
  }

  if (sourceDocument.body)
  {
    sourceDocument.body.childNodes.forEach(node => appendNode(node, document.body!));
  }

  return document;
}

function appendNode(node: Node, target: Element) {
  // check if element exist? (maybe append will work swell? 2 titles and it takes the latest?)
  if (node instanceof Element)
  {
    const query = `${node.tagName}${node.className ? "." + node.className : ""}${node.id ? "#"+node.id : ""}${Array.from(node.attributes).map(([key, value]) => {
      return `[${key}${typeof value === "string" ? `="${value}"` : ""}]`;
    }).join("")}`;

    const child = target.querySelector(query);
    if (child)
    {
      target.replaceChild(node, child)
      return;
    }
  }

  target.appendChild(node);
}