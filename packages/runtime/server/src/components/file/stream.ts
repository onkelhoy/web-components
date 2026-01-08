import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import fs from "node:fs";
import { Arguments, Terminal } from "@papit/util";

// import { getFile } from "./get";
import { FileConstants } from "./types";
import { NotFoundError } from "../errors";

export async function streamFile(
  url: string,
  destination: NodeJS.WritableStream,
  signal?: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => 
  {
    // Stream large files
    const isBinary = FileConstants.BinaryExtensions.has(path.extname(url));
    const stream = isBinary
      ? fs.createReadStream(url, { signal })
      : fs.createReadStream(url, { signal, encoding: "utf-8" });
  
    stream.pipe(destination);

    stream.on("error", (err) => {
      if (Arguments.error) Terminal.error("streaming error", url);
      if (Arguments.verbose)
      {
        console.trace(err);
      }
  
      reject(new NotFoundError(err.message));
    });
    stream.on("close", resolve);
  });
}

// export async function streamFile2(
//   url: string,
//   relativeURL: string,
//   res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
//   signal?: AbortSignal,
//   send404 = true,
// ) {
//   return new Promise<number>((resolve) => {

//     try
//     {
//       const { ext, data, wasCached } = getFile(url, relativeURL);
//       if (data)
//       {
//         if (wasCached)
//         {

//           res.setHeader('Content-Type', data.contentType);
//           res.setHeader('Content-Length', data.content.length);
//           res.setHeader('X-Cache', 'HIT');
//           res.statusCode = 200;
//           res.end(data.content);
//           return resolve(res.statusCode);
//         }

//         res.setHeader('Content-Type', data.contentType);
//         res.setHeader('X-Cache', 'MISS');
//         res.setHeader('Content-Length', data.content.length);
//         res.statusCode = 200;
//         res.end(data.content);
//         return resolve(res.statusCode);
//       }

//       if (Arguments.verbose) Terminal.write(`"${relativeURL}"`, Terminal.yellow("streaming"));

//       // Stream large files
//       const isBinary = FileConstants.BinaryExtensions.has(ext);
//       const stream = isBinary
//         ? fs.createReadStream(url, { signal })
//         : fs.createReadStream(url, { signal, encoding: "utf-8" });

//       stream.pipe(res);
//       stream.on("error", (err) => {
//         if (Arguments.error) Terminal.error("streaming error", path.dirname(url));
//         if (Arguments.verbose)
//         {
//           console.trace(err);
//         }

//         if (!res.headersSent)
//         {
//           res.statusCode = 500;
//           res.end('Internal Server Error');
//           resolve(res.statusCode);
//         }
//       });
//       stream.on("close", () => {
//         if (!res.writableEnded) res.end();
//         resolve(res.statusCode);
//       });
//     } catch (error)
//     {
//       res.statusCode = 404;
//       throw error;
//       // if (Arguments.error) Terminal.error("file streaming error", path.dirname(url));
//       // if (Arguments.verbose)
//       // {
//       //   console.trace(error);
//       // }

//       // if (!res.headersSent)
//       // {
//       //   if (send404) res.end('File not found');
//       //   resolve(res.statusCode);
//       // }
//     }
//   })
// }

// Optional: Clear cache for a specific file (useful for hot reload)
