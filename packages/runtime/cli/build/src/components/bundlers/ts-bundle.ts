// import statements 
import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Terminal, copyFolder, getArguments, getPathInfo } from "@papit/util-cli";

import { Meta } from "../meta/types";

const execAsync = promisify(exec);

export async function tsBundler(
  inputFile: string, 
  outputFile: string, 
  meta: Meta, 
  info: ReturnType<typeof getPathInfo>, 
  args: ReturnType<typeof getArguments>
) {
  if (!meta.tsconfig.info.declaration) return;

  try {
    if (args.flags.dev)
    {
      console.log('DEV MODE');
      const srcName = path.basename(path.dirname(inputFile));
      const outDir = path.dirname(outputFile);
      const srcDir = path.join(outDir, srcName);

      await execAsync(`tsc --emitDeclarationOnly -p ${meta.tsconfig.path} --declarationDir ${outDir}`);
      await copyFolder(srcDir, outDir, content => content);
      fs.rmSync(srcDir, { recursive: true, force: true })
      return;
    }
    else 
    {
      await execAsync(`tsc --emitDeclarationOnly -p ${meta.tsconfig.path} --declarationDir .papit/build`);
    }
  }
  catch (e) {
    Terminal.error("tsc failed");
    if (args.flags.verbose)
    {
      console.log(e);
    }
    process.exit(1);
  }

  if (args.flags.dev) return;

  const result = await Terminal.sessionBlock(async () => {
    // create a config object programmatically
    const extractorConfig = ExtractorConfig.prepare({
      configObject: {
        mainEntryPointFilePath: inputFile,
        projectFolder: info.local,
        compiler: {
          tsconfigFilePath: meta.tsconfig.path,
        },
        dtsRollup: {
          enabled: true,
          untrimmedFilePath: outputFile,
        },
      },
      configObjectFullPath: undefined,
      packageJsonFullPath: path.join(info.local, "package.json"),
      // no configObjectFullPath needed if you don’t have a file
    });
  
    // run API Extractor
    return Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: !!args.flags.verbose,
    });
  })

  if (!result.succeeded) {
    Terminal.error(`API Extractor failed with ${result.errorCount} errors`);
    process.exit(1);
  }
}