import { Medium, Settings } from "./types";

// this class will exist on the Peer class directly as it holds the Media based on one peer 
export class Media {
  private mediums = new Map<string, Medium>;
  private unlabelled = new Set<string>();

  public get(label: string) {
    return this.mediums.get(label);
  }

  public getUnlabelled() {
    return Array.from(this.unlabelled);
  }

  public setLabel(id: string, label: string, allowOverride = true) {
    if (allowOverride == false && this.has(label)) return false;

    const medium = this.get(id);
    if (!medium) return false;
    if (!(medium.type == "audio" || medium.type == "video")) return false;

    if (!medium.unlabelled) return false;
    medium.unlabelled = false;

    this.mediums.set(label, medium);
    this.mediums.delete(id);
  }

  public async add(label: string, setting: Settings) {
    switch (setting.type)
    {
      case "audio":
      case "video":
        {
          const constraints = setting.constraints ?? { [setting.type]: true };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          this.mediums.set(label, { type: setting.type, stream, constraints, senders: [] });

          if (setting.unlabelled) this.unlabelled.add(label);
          break;
        }
      case "screen":
        {
          const stream = await navigator.mediaDevices.getDisplayMedia(setting.options);
          this.mediums.set(label, { type: "screen", stream, options: setting.options, senders: [] });
          break;
        }
      case "data":
        {
          // we let the data as is, the Peer class needs to create it 
          this.mediums.set(label, setting);
          break;
        }
    }

    return this.mediums.get(label);
  }

  public remove(label: string) {
    if (!this.mediums.has(label)) return false;

    this.mediums.delete(label);
    return true;
  }

  public clear() {
    this.mediums.clear();
  }

  public has(label: string) {
    return this.mediums.has(label);
  }
}