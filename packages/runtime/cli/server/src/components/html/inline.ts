import path from "node:path";
import fs from "node:fs";
import { Document } from "@papit/html";
import { getPathInfo, Terminal } from "@papit/util";

import { getDocument } from "./util";

export function createInline(
  url: string,
  info: ReturnType<typeof getPathInfo>,
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
  const source = fs.readFileSync(url, { encoding: "utf-8" });
  sourceDocument.innerHTML = source;

  if (sourceDocument.head)
  {
    sourceDocument.head.childNodes.forEach(node => {
      // check if element exist? (maybe append will work swell? 2 titles and it takes the latest?)
      document.head?.appendChild(node);
    });
  }

  if (sourceDocument.body)
  {
    sourceDocument.body.childNodes.forEach(node => {
      // check if element exist?
      document.body!.appendChild(node)
    });
  }

  return document;
}