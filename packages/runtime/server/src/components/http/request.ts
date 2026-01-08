export {}
// import { Arguments, getJSON, getPathInfo, LocalPackage, Terminal } from "@papit/util";
// import { IncomingMessage, ServerResponse } from "node:http";
// import path from "node:path";
// import fs from "node:fs";

// import { streamAsset, Translation } from "../asset";
// import { getMeta } from "@papit/build";
// import { streamFile } from "../file/stream";
// import { HttpError } from "../errors";
// import { getHTML } from "../html";

// export async function handleRequest(
//   request:IncomingMessage, 
//   response:ServerResponse,
//   info: ReturnType<typeof getPathInfo>,
//   translations: Record<string, Translation>,
//   assets: Record<string, string[]>,
//   packageJSON: LocalPackage,
// ) {
//   if (request.method !== "GET")
//   {
//     if (Arguments.warning) Terminal.warn("dev-server only accepts GET requests");
//     response.statusCode = 500;
//     response.setHeader('Content-Type', 'application/json');
//     response.end(JSON.stringify({ error: `only accept GET requests, got: "${request.method}"`, code: "no-get" }));
//     return;
//   }

//   if (!request.url)
//   {
//     if (Arguments.warning) Terminal.warn("no url provided");
//     response.statusCode = 500;
//     response.setHeader('Content-Type', 'application/json');
//     response.end(JSON.stringify({ error: "no url provided", code: "no-url" }));
//     return;
//   }

//   if (request.url === "/favicon.ico")
//   {
//     return response.end("ok");
//   }

//   if (request.url === "/.well-known/appspecific/com.chrome.devtools.json")
//   {
//     return response.end("ok");
//   }

//   if (Arguments.verbose) Terminal.write(Terminal.blue("incomming request"), request.url);

//   const folder = Arguments.string("folder") ?? "";
//   let currentURL = path.join(info.local, request.url, folder);

//   if (!fs.existsSync(currentURL))
//     currentURL = path.join(info.package, request.url, folder);
//   if (!fs.existsSync(currentURL))
//     currentURL = info.local;
//   if (!fs.existsSync(currentURL))
//     currentURL = info.package;

//   try
//   {
//     const status = fs.statSync(currentURL);
//     if (status.isFile())
//     {
//       if (/\.tsx?/.test(currentURL) && (request.headers.referer?.endsWith(".js") || request.headers['sec-fetch-dest'] === "script") && !Arguments.has("no-bundle"))
//       {
//         const localInfo = getPathInfo(path.join(info.root, request.url));
//         const localPackage = getJSON<LocalPackage>(path.join(localInfo.package, "package.json"));
//         if (!localPackage) throw "missing package.json";
//         const meta = await getMeta("dev", localInfo, localPackage);
//         // return bundler(currentURL, localInfo, meta, res, localPackage);
//       }

//       const status = await streamFile(currentURL, request.url, response);
//       if (status !== 404) 
//       {
//         if (!response.headersSent) response.end();
//         return;
//       }
//     }
    
//     const result = await streamAsset(translations, assets, request, response);
//     if (result) 
//     {
//       if (!response.headersSent) response.end();
//       return
//     }
//   }
//   catch (e) 
//   {
//     console.log('seomthing wetn wrong?', e)
//     if (e instanceof HttpError)
//     {
//       response.statusCode = e.status;
//     }
//     else 
//     {
//       response.statusCode = 500;
//     }

//     if (typeof e === "string")
//     {
//       response.write(e);
//     }
//     else if (e && typeof e === "object" && "message" in e)
//     {
//       response.write(e.message);
//     }
//     else 
//     {
//       Terminal.error(e);
//       response.write("something went wrong");
//     }
//     response.end();
//   }

//   const dom = await getHTML(info, assets, packageJSON, currentURL);

//   response.statusCode = 200;
//   response.end(dom.outerHTML);
// }