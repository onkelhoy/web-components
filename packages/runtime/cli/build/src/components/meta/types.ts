import { LocalPackage } from "../../../../util/lib"
import { getTSinfo } from "./get-tsinfo";

export type Meta = {
  entryPoints: {
    record: Record<string, string>;
    keys: string[];
  };
  externals: string[];
  tsconfig: {
    info: ReturnType<typeof getTSinfo>;
    path: string;
  };
  config: LocalPackage['papit'];
}