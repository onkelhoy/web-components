import { ID, UserInfo, LogType } from "../types";
import { NetworkInfo } from "../types/network";

export class GlobalInfo {
  static logger: LogType;
  static user: UserInfo;
  static network?: NetworkInfo;
}