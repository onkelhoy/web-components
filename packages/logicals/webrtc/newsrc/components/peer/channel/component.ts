import { Media } from "../../media";
import { DataMedium } from "../../media/types";
import { ChannelMessageEvent, MessageType, SystemCloseEvent, SystemEvent, SystemMessageEvent, SystemOpenEvent } from "./types";

export class Channel extends EventTarget {

  public medium: DataMedium;
  constructor(label: string, dataChannelDict: RTCDataChannelInit | undefined, peer: RTCPeerConnection, media: Media) {
    super();
    this.init(label, dataChannelDict, peer, media);
  }

  public on(type: "system", callback: (event: CustomEvent<SystemEvent>) => void): void;
  public on(type: "error", callback: (event: CustomEvent<RTCErrorEvent>) => void): void;
  public on(type: "close", callback: (event: CustomEvent<Event>) => void): void;
  public on(type: "open", callback: (event: CustomEvent<Event>) => void): void;
  public on(type: "message", callback: (message: MessageEvent) => void): void;
  public on(type: string, callback: (...any: any[]) => void) {
    this.addEventListener(type, callback)
  }

  private async init(label: string, dataChannelDict: RTCDataChannelInit | undefined, peer: RTCPeerConnection, media: Media) {
    const channel = peer.createDataChannel(label, dataChannelDict);
    this.medium = await media.add(channel.label, {
      type: "data",
      channel,
      dataChannelDict,
    }) as DataMedium;

    if (channel.label == "system")
    {
      channel.addEventListener("close", (event: Event) => {
        this.dispatchEvent(new CustomEvent<SystemCloseEvent>("close", { detail: { type: "close", event } }));
      });
      channel.addEventListener("open", (event) => {
        this.dispatchEvent(new CustomEvent<SystemOpenEvent>("open", { detail: { type: "open", event } }));
      });
      channel.addEventListener("message", (event: MessageEvent<MessageType>) => {
        const message = Channel.GetMessage(event);
        this.dispatchEvent(new CustomEvent<SystemMessageEvent>("message", { detail: { event, message } }));
      });
      channel.addEventListener("error", (event: RTCErrorEvent) => {
        this.dispatchEvent(new CustomEvent<RTCErrorEvent>("error", { detail: event }));
      });
      return;
    }

    channel.addEventListener("close", (event: Event) => {
      this.dispatchEvent(new CustomEvent<Event>("close", { detail: event }));
    });
    channel.addEventListener("open", (event) => {
      this.dispatchEvent(new CustomEvent<Event>("open", { detail: event }));
    });
    channel.addEventListener("message", (event: MessageEvent<MessageType>) => {
      const message = Channel.GetMessage(event);
      this.dispatchEvent(new CustomEvent<ChannelMessageEvent>("message", { detail: { event, message } }));
    });
    channel.addEventListener("error", (event: RTCErrorEvent) => {
      this.dispatchEvent(new CustomEvent<RTCErrorEvent>("error", { detail: event }));
    });
  }
  // event handlers
  private systemChannel() {
    // const { channel } = this.medium;
    // channel.addEventListener("close", (event) => {
    //   // close the entire peer connection ? 
    // });
    // channel.addEventListener("open", (event: Event) => {

    // });
    // channel.addEventListener("message", (event: MessageEvent<string>) => {
    //   const data = Channel.GetMessage<SystemMessage>(event);

    // });
    // channel.addEventListener("error", (event: RTCErrorEvent) => {

    // });
  }

  // private functions 
  private static GetMessage<T = Object>(event: MessageEvent<MessageType>): MessageType | T {
    if (typeof event.data == "string" && ["{", "|"].includes(event.data[0]))
    {
      return JSON.parse(event.data) as T;
    }

    return event.data;
  }
}