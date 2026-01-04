import esbuild, { BuildOptions } from "esbuild";

export function watch(entryPoints:string[]) {
  return esbuild.build({
    entryPoints: entryPoints,
    outfile: "dist/bundle.js",
    sourcemap: true,
    watch: {
      onRebuild(error:unknown, result:unknown) {
        if (error) console.error("Build failed:", error);
        else console.log("Build succeeded!");
      }
    }
  } as BuildOptions);
}