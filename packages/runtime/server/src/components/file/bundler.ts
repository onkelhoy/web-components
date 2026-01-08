import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import fs from "node:fs";
import { Arguments, getPathInfo, LocalPackage, Terminal } from "@papit/util";
// import { getFile } from "./get";
import { getMeta, jsBundler } from "@papit/build";
import esbuild from "esbuild";
import { getURL } from "../http/url";
import { Cache } from "./cache";
// import { BuildResult } from "esbuild";

export async function bundler(
  url: ReturnType<typeof getURL>, 
  res: ServerResponse,
  cache: Cache
) {

  // at this point this is not a in a cache 
  res.statusCode = 200;
  res.setHeader('Content-Type', "text/javascript");
  res.end("console.log('ALRIGHT')")

  // const now = performance.now();
  // const file = getFile(currentURL, req.url!, true);
  // if (file.data === null)
  // {
  //   res.statusCode = 404;
  //   res.end("file not found");
  //   return;
  // }

  
  // const result = await jsBundler(url, undefined, meta, info, packageJSON) as BuildResult;

  // const result = esbuild.buildSync({
  //   bundle: true,
  //   minify: false,
  //   external: Object.keys(packageJSON.dependencies ?? {}).concat(Object.keys(packageJSON.devDependencies ?? {})).concat(Object.keys(packageJSON.peerDependencies ?? {})),
  //   // entryPoints: []
  //   format: "esm",
  //   platform: "browser",
  //   tsconfig: path.join.tsconfig.path,
  //   stdin: {
  //     contents: file.data.content,
  //   }
  // });

  // FOMR THERE 

  // const result = await esbuild.build({
  //   bundle: true,
  //   stdin: {
  //     contents: fileContent,  // your JS string
  //     resolveDir: info.package,
  //     sourcefile: url,        // virtual filename for sourcemaps & debugging
  //     loader: 'ts',           // or 'js'
  //   },
  //   write: false,
  //   format: 'esm',
  //   platform: 'browser',
  //   external: meta.externals,
  // });

  // if (result.errors.length > 0)
  // {
  //   res.statusCode = 500;
  //   res.end(JSON.stringify(result.errors, null, 2));
  //   return;
  // }

  // const data = result.outputFiles?.at(0);
  // if (!data)
  // {
  //   console.log('eee?', result)
  //   res.statusCode = 404;
  //   res.end("file could not be bundled found");
  //   return;
  // }

  // console.log('it took', performance.now() - now);

  // res.setHeader('Content-Type', "text/javascript");
  // res.setHeader('X-Cache', "MISS");
  // res.setHeader('Content-Length', data.text.length);
  // res.statusCode = 200;
  // res.end(data.text);

  // TO HERE

  // res.end(file.data.content);
  // return resolve(res.statusCode);
  // res.se
  return;

  // bundle it with esbuild 
  // executor((
  //   input: 
  // ))
}