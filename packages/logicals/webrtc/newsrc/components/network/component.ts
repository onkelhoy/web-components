import { Topology } from "./topology";
import { ITopology, Settings } from "./types";

export class Network extends EventTarget {
  private fingertable: Set<string>;

  constructor(
    private settings: Settings
  ) {
    super();
    this.fingertable = new Set<string>
  }

  // public methods 
  public forward(target: string) {
    return this.getTopology().forward(target, this.settings);
  }
  public join(id: string, password?: string) {
    if (this.settings.password && password !== this.settings.password)
    {
      return false;
    }

    return this.getTopology().join(id, this.settings);
  }
  public remove(id: string) {
    return this.getTopology().remove(id, this.settings);
  }

  private getTopology(): ITopology {
    if (this.settings.topology.type == "custom")
    {
      return this.settings.topology;
    }

    return Topology[this.settings.topology.type];
  }
}