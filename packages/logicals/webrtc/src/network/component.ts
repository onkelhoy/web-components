import { NetworkMessage, Settings, NetworkInternalMessage } from "./types";

export class Network extends EventTarget {
  private hopLimit: number = 10;
  private ttl: number = 1; // this gets updated on each join + leave event 

  constructor(
    private readonly settings: Settings,
    private readonly id: string,
  ) {
    super();

    if (this.settings.ttl) this.ttl = this.settings.ttl;
    if (this.settings.hopLimit) this.hopLimit = this.settings.hopLimit;
  }

  public send(message: NetworkMessage) {
    if (message.receiver === this.id)
    {
      return void this.dispatchEvent(new CustomEvent("message", { detail: message }));
    }

    message.hops ??= [];
    message.ttl ??= this.ttl ?? 10;
    message.hopLimit ??= this.hopLimit;

    // record this peer as a relay
    if (!message.hops.includes(this.id))
    {
      message.hops.push(this.id);
    }
    else 
    {
      message.hopLimit--;
    }

    message.ttl--;

    if (message.ttl <= 0 || message.hopLimit <= 0)
    {
      this.dispatchEvent(new CustomEvent("network-drop", { detail: message }));
      return;
    }

    if (this.isInternalMessage(message))
    {
      return void this.handleInternalMessage(message);
    }

    // const relay = this.topology.route(message.receiver);

    // if (!relay) {
    //   this.dispatchEvent(new CustomEvent("network-unreachable", { detail: message }));
    //   return;
    // }

    // this.dispatchEvent(
    //   new CustomEvent("network-forward", {
    //     detail: { to: nextHop, message: { ...message, ttl: message.ttl - 1 } }
    //   })
    // );

    this.dispatchEvent(new CustomEvent("forward", {
      detail: {
        ...message,
        relay: message.receiver, // TODO: change later so topology will give us this one. 
      }
    }))
  }

  private isInternalMessage(message: NetworkMessage): message is NetworkInternalMessage {
    return message.type === "network";
  }


  private handleInternalMessage(message: NetworkInternalMessage) {
    switch (message.payload.event)
    {
      case "join":
        this.hopLimit++;
        break;
      case "leave":
        this.hopLimit--;
        break;
      case "update":
        break;
      default:
        this.error("network-event", "invalid type", message);
        break;
    }
  }


  // util functions 
  private error(type: string, message: string, payload: any) {
    this.dispatchEvent(new CustomEvent("error", { detail: { type, message, payload } }));
  }
  private debug(type: string, message: string, payload: any) {
    this.dispatchEvent(new CustomEvent("debug", { detail: { type, message, payload } }));
  }
}