import { Config, ID } from "types";
import { PartialNetworkInfo } from "types/network";
import { GlobalInfo } from "utils";

declare global {
  interface Window {
    p2pclient: {
      init(config: Config): void;
      onMessage(channel: string, callback: Function): void;
      on(event: string, callback: Function): void;
      join(network: ID, config?: Record<string, any>): void;
      register(network: PartialNetworkInfo): void;

      info: GlobalInfo;
    }
  }
}

export { };