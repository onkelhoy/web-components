import { getConfig } from "@papit/cli-util";
import { getTSConfiginfo } from "./ts-info";

export type Meta = {
  entryPoints: {
    record: Record<string, string>;
    keys: string[];
  };
  externals: string[];
  tsconfig: {
    info: ReturnType<typeof getTSConfiginfo>;
    path: string;
  };
  config: NonNullable<ReturnType<typeof getConfig>>;
}