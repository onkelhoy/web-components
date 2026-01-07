import type { BuildOptions, BuildResult } from "esbuild";

export type ExecutorOptions = {
  location: string;
  mode: "dev"|"prod";
  buildMode: "individual"|"all"|"bloodline"|"ancestors"|"descendants";
  callback(counter: number, result: BuildResult<BuildOptions>): void;
}