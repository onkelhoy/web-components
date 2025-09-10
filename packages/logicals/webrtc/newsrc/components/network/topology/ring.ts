import { Settings } from "../types";

export class RingTopology {
  static join(id: string, network: Settings) {
    return true;
  }
  static remove(id: string, network: Settings) {

  }
  static forward(target: string, network: Settings) {
    return target;
  }
}