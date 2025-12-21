// import statements 
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Terminal, getArguments, getPackageInfo } from "@papit/cli-util";

import { Meta } from "../meta/types";

const execAsync = promisify(exec);

export async function tsBundler(
  inputFile: string, 
  outputFile: string, 
  meta: Meta, 
  info: ReturnType<typeof getPackageInfo>, 
  args: ReturnType<typeof getArguments>
) {
  if (!meta.tsconfig.info.declaration) return;

  try {
    await execAsync(`tsc --emitDeclarationOnly -p ${meta.tsconfig.path} --declarationDir .papit/build`);
  }
  catch {
    Terminal.error("tsc failed");
    process.exit(1);
  }

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