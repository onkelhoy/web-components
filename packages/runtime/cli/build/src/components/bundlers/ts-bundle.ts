// import statements 
import path from "node:path";
import fs from "node:fs";
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Arguments, Terminal, copyFolder, getPathInfo } from "@papit/util-cli";

import { Meta } from "../meta/types";
import { spawnCommand } from "helper";

export async function tsBundler(
  inputFile: string, 
  outputFile: string, 
  meta: Meta, 
  info: ReturnType<typeof getPathInfo>, 
) {
  if (!meta.tsconfig.info.declaration) return;

  try {
    if (Arguments.args.flags.dev)
    {
      const srcName = path.basename(path.dirname(inputFile));
      const outDir = path.dirname(outputFile);
      const srcDir = path.join(outDir, srcName);

      await spawnCommand(
        "tsc", 
        info.local,
        ["--emitDeclarationOnly", "-p", meta.tsconfig.path, "--declarationDir", outDir], 
      );
      await copyFolder(srcDir, outDir, content => content);
      fs.rmSync(srcDir, { recursive: true, force: true })
      return;
    }
    else 
    {
      const outDir = path.join(info.local, ".papit/build");
      await spawnCommand(
        "tsc", 
        info.local,
        ["--emitDeclarationOnly", "-p", meta.tsconfig.path, "--declarationDir",  outDir], 
      );
    }
  }
  catch (e) {
    Terminal.error("tsc failed");
    if (Arguments.debug)
    {
      console.log(e);
    }
    process.exit(1);
  }

  if (Arguments.args.flags.dev) return;

  const result = await Terminal.surpress(async () => {
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
      showVerboseMessages: !!Arguments.verbose,
    });
  });

  if (!result.succeeded) {
    Terminal.error(`API Extractor failed with ${result.errorCount} errors`);
    process.exit(1);
  }
}