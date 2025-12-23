// import statements 
import path from "node:path";
import ts from "typescript";

export function getTSinfo(tsconfigPath: string) {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(`Error reading tsconfig: ${configFile.error.messageText}`);
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );

  return {
    declaration: Boolean(parsed.options.declaration),
    outDir: parsed.options.outDir,
  };
}