import { Media } from "../media";
import { Socket } from "../socket";

import { MediaSettings, StreamSettings, Settings, PrimitiveChannelData } from "./types";

export class Peer extends EventTarget {
  private connection: RTCPeerConnection;
  private outgoingMedia = new Media();
  private incomingMedia = new Media();

  constructor(settings: Settings) {
    super();
    this.connection = new RTCPeerConnection(settings.configuration);

    // setup events 
    this.connection.ondatachannel = this.handleDatachannel;
    this.connection.ontrack = this.handleTrack;
  }

  public async handshake(socket: Socket) {

  }

  public getMedia(mediaLabel: string) {
    return this.incomingMedia.get(mediaLabel);
  }

  public async add(mediaLabel: string, mediaSetting: MediaSettings, allowOverride = true) {
    if (!allowOverride && this.outgoingMedia.has(mediaLabel))
      return void this.dispatchError("peer.add", "medium already exist", mediaLabel);

    if (mediaSetting.type == "data")
    {
      return this.addChannel(mediaLabel, mediaSetting.dataChannelDict);
    }
    else 
    {
      return this.addStream(mediaLabel, mediaSetting);
    }
  }

  public send(mediaLabel: string, data: PrimitiveChannelData | Object) {
    const medium = this.outgoingMedia.get(mediaLabel);
    if (!medium)
      return void this.dispatchError("peer.send", "has no media", mediaLabel);

    if (medium.type != "data")
      return void this.dispatchError("peer.send", "invalid medium type", medium.type);

    // sending data as original 
    if (typeof data === "string" || data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data))
    {
      return void medium.channel.send(data as any);
    }

    // converting data
    medium.channel.send(JSON.stringify(data));
  }

  // event handlers 
  private handleDatachannel = ({ channel }: RTCDataChannelEvent) => {
    this.incomingMedia.add(channel.label, {
      type: "data",
      channel,
      dataChannelDict: undefined, // do we want to add this info later or its okay? 
    });

    this.setupChannel(channel);
  }
  private handleTrack = (event: RTCTrackEvent) => {
    const stream = event.streams[0];
    const track = event.track;

    this.incomingMedia.add(stream.id, {
      type: track.kind === "audio" ? "audio" : "video",
      constraints: undefined,
      stream,
      unlabelled: true,
    });
  }

  // private functions 
  private async addStream(mediaLabel: string, streamSetting: StreamSettings) {
    const medium = await this.outgoingMedia.add(mediaLabel, streamSetting);
    if (!medium) 
    {
      this.dispatchError("peer.addStream", "could not create medium", [mediaLabel, streamSetting]);
      return null;
    }
    if (medium.type == "data") 
    {
      this.outgoingMedia.remove(mediaLabel);
      this.dispatchError("peer.addStream", "medium is not stream", [mediaLabel, streamSetting]);
      return null;
    }

    medium.senders = medium.stream.getTracks().map(track => this.connection.addTrack(track, medium.stream));

    return medium;
  }
  private async addChannel(label: string, dataChannelDict: RTCDataChannelInit | undefined) {
    const channel = this.connection.createDataChannel(label, dataChannelDict);
    this.setupChannel(channel);

    const medium = await this.outgoingMedia.add(label, {
      type: "data",
      channel,
      dataChannelDict,
    });

    if (!medium) 
    {
      this.dispatchError("peer.addChannel", "could not create medium", [label, dataChannelDict]);
      return null;
    }
    if (medium.type == "data")
    {
      this.outgoingMedia.remove(label);
      this.dispatchError("peer.addChannel", "medium is not data", [label, dataChannelDict]);
      return null;
    }

    return medium;
  }
  private setupChannel(channel: RTCDataChannel) {
    if (channel.label === "system") return void this.setupSystemChannel(channel);
    channel.addEventListener("close", () => {
      this.dispatchChannel(channel.label, "close");
      this.incomingMedia.remove(channel.label);
      this.outgoingMedia.remove(channel.label);
    });

    channel.addEventListener("open", () => {
      this.dispatchChannel(channel.label, "open", channel);
    });

    channel.addEventListener("message", (event: MessageEvent<PrimitiveChannelData>) => {
      this.dispatchChannel(channel.label, "message", Peer.extractChannelMessage(event));
    });

    channel.addEventListener("error", (event: RTCErrorEvent) => {
      this.dispatchChannel(channel.label, "error", event);
      this.dispatchError("channel", channel.label, event);
    });
  }
  private setupSystemChannel(channel: RTCDataChannel) {
    channel.addEventListener("close", () => {
      // close the entire peer connection ? 
    });

    channel.addEventListener("open", () => {
      // send offline data ? 
    });

    channel.addEventListener("message", (event: MessageEvent<string>) => {
      const data = Peer.extractChannelMessage(event);

      // do something
    });

    channel.addEventListener("error", (event: RTCErrorEvent) => {
      this.dispatchChannel(channel.label, "error", event);
      this.dispatchError("channel", channel.label, event);
    });
  }
  private static extractChannelMessage(event: MessageEvent<PrimitiveChannelData>): PrimitiveChannelData | Object {
    if (typeof event.data == "string" && ["{", "|"].includes(event.data[0]))
    {
      return JSON.parse(event.data);
    }

    return event.data;
  }

  // event helpers
  private dispatchError(type: string, error: string, payload?: any) {
    this.dispatchEvent(new CustomEvent("error", { detail: { type, error, payload } }));
  }
  private dispatchChannel(label: string, event: string, payload?: any) {
    this.dispatchEvent(new CustomEvent(`${label}-${event}`, { detail: payload }));
  }
}