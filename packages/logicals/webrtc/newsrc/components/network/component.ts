import { Topology } from "./topology";
import { Settings } from "./types";

export class Network extends EventTarget {

  constructor(
    private settings: Settings
  ) {
    super();
  }

  // public methods 
  public forward(target: string) {
    switch (this.settings.topology.type)
    {
      case "custom":
        return this.settings.topology.forward(target, this.settings);
      default:
        return Topology[this.settings.topology.type].forward(target, this.settings);
    }
  }
  public join(id: string, password?: string) {
    if (this.settings.password && password !== this.settings.password)
    {
      return false;
    }

    switch (this.settings.topology.type)
    {
      case "custom":
        return this.settings.topology.join(id, this.settings);
      default:
        return Topology[this.settings.topology.type].join(id, this.settings);
    }
  }
  public remove(id: string) {

    switch (this.settings.topology.type)
    {
      case "custom":
        return this.settings.topology.remove(id, this.settings);
      default:
        return Topology[this.settings.topology.type].remove(id, this.settings);
    }
  }
}