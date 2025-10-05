import { Media } from "../media";
import { Socket } from "../socket";
import { Channel } from "../channel";

// PrimitiveChannelData, ChannelEvent, SystemMessage 
import { MediaSettings, StreamSettings, Settings, SystemMessage, } from "./types";

export class Peer extends EventTarget {
  private caller = false;
  private connection: RTCPeerConnection;
  // private outgoingMedia = new Media();
  // private incomingMedia = new Media();
  private pendingIceCandidates: RTCIceCandidate[] = [];

  constructor(settings: Settings) {
    super();
    this.connection = new RTCPeerConnection(settings.configuration);
    this.caller = !!settings.caller;

    // setup events 
    this.connection.ondatachannel = this.handleIncommingDataChannel;
    this.connection.ontrack = this.handleIncommingTrack;
    // ice events 
    this.connection.oniceconnectionstatechange = this.handleIceConnectionStateChange;
    this.connection.onicecandidate = this.handleIceCandidate;
    this.connection.onicecandidateerror = (event) => {
      this.dispatchError("system", "ice", event);
    };
  }

  // private functions 
  private setupChannel(channel: RTCDataChannel) {
    const channelEvents = ["close", "open", "error", "message"] as const;

    channelEvents.forEach(event => (
      channel.addEventListener(event, (detail) => {
        this.dispatchEvent(new CustomEvent(`channel-${event}-${channel.label}`, { detail }))
      })
    ));
  }

  // event handlers 
  private handleIncommingDataChannel = ({ channel }: RTCDataChannelEvent) => {
    if (channel.label === "system")
    {
      return void this.setupSystem(channel);
    }

    this.setupChannel(channel);
  }
  private handleIncommingTrack = (event: RTCTrackEvent) => {
    console.log('track', event);
  }
  private handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    if (!event.candidate) return;
    // we need transport layer for this 
    this.dispatchEvent(new CustomEvent("handshake-ice", { detail: event.candidate }));
  }
  private handleIceConnectionStateChange = () => {
    if (this.connection.iceConnectionState === "failed" && this.caller)
    {
      this.createOffer(false);
    }
    else if (this.connection.iceConnectionState === "disconnected")
    {
      this.dispatchEvent(new Event("disconnected"))
    }
  }

  // system 

  private async addIceCandidate(candidate: RTCIceCandidate) {
    if (!this.connection.remoteDescription)
    {
      this.pendingIceCandidates.push(candidate);
      return;
    }

    try
    {
      await this.connection.addIceCandidate(candidate);
    }
    catch (error) 
    {
      this.dispatchError("system", "ice-candidate", error);
    }
  }
  private setupSystem(channel: RTCDataChannel) {

    channel.addEventListener("close", (event: Event) => {
      // disconnected?
      this.dispatchEvent(new Event("disconnected"));
    });

    channel.addEventListener("open", (event: Event) => {
      // connection 
    });

    channel.addEventListener("error", (event: RTCErrorEvent) => {
      // whats going on?
      console.log('system error', event);
    });

    channel.addEventListener("message", async (event: MessageEvent) => {
      const payload = JSON.parse(event.data) as SystemMessage;

      switch (payload.type)
      {
        case "handshake":

          switch (payload.handshake)
          {
            case "ice":
              return void this.addIceCandidate(payload.candidate);
            case "answer":
              await this.connection.setRemoteDescription(payload.answer);

              // process any queued candidates
              this.pendingIceCandidates.forEach(this.addIceCandidate);
              this.pendingIceCandidates = [];
              break;
            case "offer":
              break;
            default:
              this.dispatchError("system", "incorrect handshake type received", payload);
              break;
          }

          break;
        default:
          this.dispatchError("system", "incorrect system message type received", payload);
          break;
      }
    });
  }

  private async createOffer(first = true) {
    const offer = await this.connection.createOffer({ iceRestart: first ?? undefined });
    await this.connection.setLocalDescription(offer);

    // we need transport layer for this 
    this.dispatchEvent(new CustomEvent("handshake-offer", { detail: offer }));
  }
  private async createAnswer() {

  }

  // public async handshake(socket: Socket) {

  // }

  // public getMedia(mediaLabel: string) {
  //   return this.incomingMedia.get(mediaLabel);
  // }

  // public async add(mediaLabel: string, mediaSetting: MediaSettings, allowOverride = true) {
  //   if (!allowOverride && this.outgoingMedia.has(mediaLabel))
  //     return void this.dispatchError("peer.add", "medium already exist", mediaLabel);

  //   if (mediaSetting.type == "data")
  //   {
  //     // return this.addChannel(mediaLabel, mediaSetting.dataChannelDict);
  //     // const channel = new Channel(mediaLabel, mediaSetting.dataChannelDict, this.connection);
  //     // await this.outgoingMedia.add(channel.label, {
  //     //   type: "data",
  //     //   channel,
  //     //   dataChannelDict,
  //     // }) as DataMedium;
  //   }
  //   else 
  //   {
  //     return this.addStream(mediaLabel, mediaSetting);
  //   }
  // }

  // public send(mediaLabel: string, data: PrimitiveChannelData | Object) {
  //   const medium = this.outgoingMedia.get(mediaLabel);
  //   if (!medium)
  //     return void this.dispatchError("peer.send", "has no media", mediaLabel);

  //   if (medium.type != "data")
  //     return void this.dispatchError("peer.send", "invalid medium type", medium.type);

  //   // sending data as original 
  //   if (typeof data === "string" || data instanceof Blob || data instanceof ArrayBuffer || ArrayBuffer.isView(data))
  //   {
  //     return void medium.channel.send(data as any);
  //   }

  //   // converting data
  //   medium.channel.send(JSON.stringify(data));
  // }

  // event handlers 
  // private handleIncommingDataChannel = ({ channel }: RTCDataChannelEvent) => {
  //   // this.incomingMedia.add(channel.label, {
  //   //   type: "data",
  //   //   channel,
  //   //   dataChannelDict: undefined, // do we want to add this info later or its okay? 
  //   // });

  //   // this.setupChannel(channel);
  // }
  // private handleIncommingTrack = (event: RTCTrackEvent) => {
  //   const stream = event.streams[0];
  //   const track = event.track;

  //   this.incomingMedia.add(stream.id, {
  //     type: track.kind === "audio" ? "audio" : "video",
  //     constraints: undefined,
  //     stream,
  //     unlabelled: true,
  //   });
  // }

  // private functions 
  // private async addStream(mediaLabel: string, streamSetting: StreamSettings) {
  //   const medium = await this.outgoingMedia.add(mediaLabel, streamSetting);
  //   if (!medium) 
  //   {
  //     this.dispatchError("peer.addStream", "could not create medium", [mediaLabel, streamSetting]);
  //     return null;
  //   }
  //   if (medium.type == "data") 
  //   {
  //     this.outgoingMedia.remove(mediaLabel);
  //     this.dispatchError("peer.addStream", "medium is not stream", [mediaLabel, streamSetting]);
  //     return null;
  //   }

  //   medium.senders = medium.stream.getTracks().map(track => this.connection.addTrack(track, medium.stream));

  //   return medium;
  // }
  // private async addChannel(label: string, dataChannelDict: RTCDataChannelInit | undefined) {
  //   const channel = this.connection.createDataChannel(label, dataChannelDict);
  //   this.setupChannel(channel);

  //   const medium = await this.outgoingMedia.add(label, {
  //     type: "data",
  //     channel,
  //     dataChannelDict,
  //   });

  //   if (!medium) 
  //   {
  //     this.dispatchError("peer.addChannel", "could not create medium", [label, dataChannelDict]);
  //     return null;
  //   }
  //   if (medium.type == "data")
  //   {
  //     this.outgoingMedia.remove(label);
  //     this.dispatchError("peer.addChannel", "medium is not data", [label, dataChannelDict]);
  //     return null;
  //   }

  //   return medium;
  // }
  // private setupChannel(channel: RTCDataChannel) {
  //   if (channel.label === "system") return void this.setupSystemChannel(channel);
  //   channel.addEventListener("close", (event) => {
  //     this.dispatchChannel(channel, "close", null, event);
  //     this.incomingMedia.remove(channel.label);
  //     this.outgoingMedia.remove(channel.label);
  //   });

  //   channel.addEventListener("open", (event) => {
  //     this.dispatchChannel(channel, "open", null, event);
  //   });

  //   channel.addEventListener("message", (event: MessageEvent<PrimitiveChannelData>) => {
  //     this.dispatchChannel(channel, "message", Peer.extractChannelMessage(event), event);
  //   });

  //   channel.addEventListener("error", (event: RTCErrorEvent) => {
  //     this.dispatchChannel(channel, "error", null, event);
  //     this.dispatchError("channel", channel.label, event);
  //   });
  // }
  // private setupSystemChannel(channel: RTCDataChannel) {
  //   channel.addEventListener("close", (event) => {
  //     // close the entire peer connection ? 
  //   });

  //   channel.addEventListener("open", (event: Event) => {
  //   });

  //   channel.addEventListener("message", (event: MessageEvent<string>) => {
  //     const data = Peer.extractChannelMessage<SystemMessage>(event);

  //   });

  //   channel.addEventListener("error", (event: RTCErrorEvent) => {

  //   });
  // }
  // private static extractChannelMessage<T = Object>(event: MessageEvent<PrimitiveChannelData>): PrimitiveChannelData | T {
  //   if (typeof event.data == "string" && ["{", "|"].includes(event.data[0]))
  //   {
  //     return JSON.parse(event.data) as T;
  //   }

  //   return event.data;
  // }

  // event helpers
  private dispatchError(type: string, error: string, payload?: any) {
    this.dispatchEvent(new CustomEvent("error", { detail: { type, error, payload } }));
  }
  // private dispatchChannel(channel: RTCDataChannel, type: string, payload: any, event: Event) {
  //   this.dispatchEvent(new CustomEvent<ChannelEvent>(`${channel.label}-${type}`, { detail: { payload, event } }));
  // }


  // private createChannel() {
  //   const channel = this.connection.createDataChannel(label, dataChannelDict);

  //   channel.addEventListener("close", (event: Event) => {
  //     this.dispatchEvent(new CustomEvent<Event>("close", { detail: event }));
  //   });
  //   channel.addEventListener("open", (event) => {
  //     this.dispatchEvent(new CustomEvent<Event>("open", { detail: event }));
  //   });
  //   channel.addEventListener("message", (event: MessageEvent<MessageType>) => {
  //     const message = Channel.GetMessage(event);
  //     this.dispatchEvent(new CustomEvent<ChannelMessageEvent>("message", { detail: { event, message } }));
  //   });
  //   channel.addEventListener("error", (event: RTCErrorEvent) => {
  //     this.dispatchEvent(new CustomEvent<RTCErrorEvent>("error", { detail: event }));
  //   });
  // }
}