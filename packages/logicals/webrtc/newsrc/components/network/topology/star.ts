import { Settings, ITopology } from "../types";

export const StarTopology: ITopology = {
  join(id: string, network: Settings) {
    return true;
  },
  remove(id: string, network: Settings) {

  },
  forward(target: string, network: Settings) {
    return target;
  }
}