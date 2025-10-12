import { UserInfo, NetworkInfo } from "types";

// local 
import { LogLevel } from "./logger";

export class GlobalInfo {
  static logger: LogLevel;
  static user: UserInfo;
  static network?: NetworkInfo;
}