// import statements 
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Extractor, ExtractorConfig, ExtractorLogLevel, ExtractorResult } from '@microsoft/api-extractor';
import { Package, Terminal, getArguments, getConfig, getJSON, getPackageInfo } from "@papit/cli-util";

const execAsync = promisify(exec);

export async function typescript(
  inputFile: string, 
  outputFile: string, 
  tsconfigFilePath: string, 
  pakagge: Package,
  info: ReturnType<typeof getPackageInfo>, 
  args: ReturnType<typeof getArguments>
) {
  try {
    await execAsync(`tsc --emitDeclarationOnly -p ${tsconfigFilePath}`);
  }
  catch {
    Terminal.error("tsc failed");
    process.exit(1);
  }
  // create a config object programmatically
  const extractorConfig = ExtractorConfig.prepare({
    configObject: {
      mainEntryPointFilePath: inputFile,
      projectFolder: info.local,
      compiler: {
        tsconfigFilePath: tsconfigFilePath,
      },
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: path.join(info.local, 'temp', outputFile+".d.ts"),
      },
      messages: {
        compilerMessageReporting: {
          default: {
            logLevel: args.flags.verbose ? ExtractorLogLevel.Verbose : ExtractorLogLevel.Warning,
          }
        },
      },
    },
    configObjectFullPath: "",
    packageJsonFullPath: path.join(info.local, "package.json"),
    // no configObjectFullPath needed if you don’t have a file
  });

  // run API Extractor
  const result: ExtractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: !!args.flags.verbose,
  });

  if (!result.succeeded) {
    Terminal.error(`API Extractor failed with ${result.errorCount} errors`);
    process.exit(1);
  }
}