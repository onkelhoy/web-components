import { ITopology, Settings } from "../types";

export const CordTopology: ITopology = {
  join(id: string, network: Settings) {
    return true;
  },
  remove(id: string, network: Settings) {

  },
  forward(target: string, network: Settings) {
    return target;
  }
}