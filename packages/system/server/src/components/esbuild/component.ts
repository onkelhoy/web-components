import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

// local imports
import { update as socketupdate, error as socketerror } from "../socket";

const outputfolder = path.join(process.env.LOCATION as string, '.temp');

// Plugin for handling rebuilds with esbuild
const RebuildPlugin = {
  name: 'rebuild',
  setup(build: any) {
    // When build ends, handle recompilation logic
    build.onEnd((result: any) => {
      try {
        // Get entry point name; assume single entry point for simplicity
        const name = build.initialOptions.entryPoints[0];
        // Track number of rebuilds for the entry point
        contexts[name].builds++;
        // Process only if more than one build has occurred
        if (contexts[name].builds > 1) {
          // Extract filename from path and read the output file
          const filename = name.split('/').pop();
          // Handle errors, if any, using a socket communication function
          if (result.errors.length > 0) {
            // Assumes socketerror is a predefined function elsewhere
            socketerror(filename, result.errors)
            return
          }

          const url = path.join(outputfolder, filename);
          const file = fs.readFileSync(url, 'utf-8');
          // Send updated file content to client via socket
          socketupdate(filename, file);
        }
      }
      catch (error) {
        // Log errors that occur during the rebuild handling
        if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log(error)
        console.log('something went wrong')
      }
    })
  },
}

const output_dir = path.join(process.env.LOCATION as string, '.temp');

function strip(url: string) {
  let loc = process.env.LOCATION as string;
  if (!loc.endsWith('/')) loc += "/";

  const stripped = url.replace(loc, '');
  return stripped;
}

// == EXPOSE ======
// Store build contexts for entry points
export const contexts: Record<string, {
  ctx: esbuild.BuildContext<{
    entryPoints: string[];
    bundle: true;
    outfile: string;
    plugins: {
      name: string;
      setup(build: any): void;
    }[];
  }>;
  builds: number;
}> = {};
// Function to initiate watch mode on a file path with esbuild
export async function watch(file_path: string) {
  if (!contexts[file_path]) {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log('[esbuild - watch]', file_path)
    const outfile = path.join(output_dir, strip(file_path));

    await build(file_path, outfile);

    // Set up context for rebuilds with the RebuildPlugin
    const ctx = await esbuild.context({
      entryPoints: [file_path],
      bundle: true,
      outfile: outfile,
      plugins: [RebuildPlugin],
    });
    // Save the context for later disposal and rebuild tracking
    contexts[file_path] = { ctx, builds: 0 };
    // Start the watcher
    await ctx.watch();
  }
}
export async function build(file_path: string, outfile: string | null = null) {
  if (outfile === null) {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log('[esbuild - build]', file_path)
    outfile = path.join(output_dir, strip(file_path));
  }

  // Perform initial build
  await esbuild.build({
    entryPoints: [file_path],
    bundle: true,
    outfile,
  });
}
// Clean up all contexts
export function cleanup() {
  if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log('\x1b[32m- [esbuild] disposing watcher-contexts\x1b[0m')
  Object.values(contexts).forEach(v => v.ctx.dispose());
}