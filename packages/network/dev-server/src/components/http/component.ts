// import statements 
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import { Arguments, getPathInfo, LocalPackage, Terminal } from "@papit/util-cli";
import { Document, Element } from "@papit/html";

// local imports 
import { upgrade } from "./socket";
// import { request as handlerequest } from "../request";
import { Translation } from "../asset";
import { getPort } from "./port";
import { getHTML } from "./html";

let PORT = Number(Arguments.args.flags.port || 3000);

export let server: null | http.Server = null;

export async function start(
  info: ReturnType<typeof getPathInfo>,
  translations: Record<string, Translation>, 
  assets: Record<string, string[]>,
  packageJSON: LocalPackage,
) {
  PORT = await getPort(PORT);
  server = http.createServer();

  server.listen(PORT, () => {
    Arguments.args.flags.port = String(PORT);
    if (Arguments.info)
    {
      Terminal.write(Terminal.yellow("root") + ":", info.root);
      Terminal.write(Terminal.yellow("package") + ":", info.package);
      Terminal.write(Terminal.yellow("location") + ":", info.local);
      Terminal.write();
    }
    if (!Arguments.silent) Terminal.write("server:", Terminal.blue(String(PORT)), Terminal.yellow("- running"));
  });

  // events 
  server.on("request", async (req, res) => {
    if (req.method !== "GET") {
      if (Arguments.warning) Terminal.warn("dev-server only accepts GET requests");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `only accept GET requests, got: "${req.method}"`, code: "no-get" }));
      return;
    }

    if (!req.url) {
      if (Arguments.warning) Terminal.warn("no url provided");
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
      return;
    }

    if (req.url === "/favicon.ico")
    {
      return res.end("ok");
    }

    if (req.url === "/.well-known/appspecific/com.chrome.devtools.json")
    {
      return res.end("ok");
    }



    if (Arguments.verbose) Terminal.write(Terminal.blue("incomming request"), req.url);

    // this regex will look for "hello/" or "hello" or "hello.html"
    // if (/^(\/([^\/]+\/)*([^\/\.]+|[^\/]+\.html)?)?$/.test(req.url)) 
    // {
    //   // handleHTML(req, res); WHAT?
    //   return;
    // }

    function sendFile(url: string) {
      const stream = fs.createReadStream(url, { encoding: "utf-8" });
      stream.pipe(res);
      stream.on("error", res.destroy);
      stream.on("close", () => res.end());
    }

    if (assets[req.url]) 
    {
      const copy = [...assets[req.url]];
      while (copy.length > 0)
      {
        const url = copy.pop()!;
        if (!fs.existsSync(url)) continue;
        return void sendFile(url);
      }

      Terminal.error("could not find asset");
      console.log({
        url: req.url, 
        assets: assets[req.url],
      });

      res.statusCode = 404;
      res.end("could not find asset");
      return;
    }

    let currentURL = path.join(info.local, req.url);
    if (!fs.existsSync(currentURL))
      currentURL = path.join(info.package, req.url);
    if (!fs.existsSync(currentURL))
      currentURL = info.local;
    if (!fs.existsSync(currentURL))
      currentURL = info.package;

    const status = fs.statSync(currentURL);
    if (status.isFile())
    {
      return void sendFile(currentURL);
    }

    const FFs = fs.readdirSync(currentURL);
    

    // const baseTemplate = new Document();
    // let baseTemplateSource = path.join(info.script!, "asset/templates/base.html");
    // if (typeof Arguments.args.flags['base-template'] === "string" && fs.existsSync(Arguments.args.flags['base-template']))
    // {
    //   baseTemplateSource = Arguments.args.flags['base-template'];
    // }

    // if (!fs.existsSync(baseTemplateSource))
    // {
    //   console.log(info.script);
    //   Terminal.error("could not find base template html file");
    //   process.exit(1);
    // }

    // baseTemplate.innerHTML = fs.readFileSync(baseTemplateSource, { encoding: "utf-8" });
    // baseTemplate.title = packageJSON.name

    // if (info.local !== info.package)
    // {
    //   baseTemplate.title += ` ${path.dirname(info.local)}`
    // }

    // if (htmlFiles.length > 0)
    // {
    //   const dom = new Document();
    //   const content = fs.readFileSync(path.join(currentURL, htmlFiles[0]), { encoding: "utf-8" });
    //   dom.innerHTML = content;

    //   if 

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

    const dom = await getHTML(info, packageJSON, FFs, currentURL);

    res.statusCode = 200;

    res.end(dom.outerHTML);
  });

  server.on('error', (error: Error) => {
    if (Arguments.error)
    {
      Terminal.error(error.name, error.message, error.stack ?? "");
    }
  });

  // socket related
  server.on('upgrade', upgrade);
}

export function close() {
  server?.close();
  if (!Arguments.silent) Terminal.write("server:", Terminal.blue(String(PORT)), Terminal.yellow("- shutdown"));
}