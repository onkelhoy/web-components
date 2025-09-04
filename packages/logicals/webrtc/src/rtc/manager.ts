// types
import { TargetMessage } from "types.message";
import { Events, NetworkInfo } from "types";

// utils 
import { Reactor } from "utils/reactor";
import { Logger } from "utils/logger";
import { GlobalInfo } from "utils/global";

// media 
import { Medium } from "media/medium";
import { DataChannelConfig, MediaType } from "media/types";

// locals
import { Connection } from "./connection";
import { PeerSignalMessage, PeerSignalType } from "./types";

// variables
const reactor = new Reactor();

export class Manager {
  public peers: Map<string, Connection> = new Map();
  private log = Logger("peer-manager");
  private error = Logger("peer-manager", "error");
  public media = new Medium();
  private config?: RTCConfiguration;

  constructor(config?: RTCConfiguration) {
    this.config = config;

    reactor.on(Events.PeerAdd, this.add);
    reactor.on(Events.NetworkUpdate, this.network);
  }

  private network = (info: NetworkInfo) => {
    if (info.host !== GlobalInfo.user.id) return;
    if (this.media.channels.has("system")) return;

    const config: DataChannelConfig = {
      label: 'system',
    };
    this.media.add(MediaType.Data, config);
  }
  add = (message: PeerSignalMessage) => {
    if (this.peers.has(message.sender))
    {
      if (["debug"].includes(GlobalInfo.logger)) this.log('adding', 'dupplicate', message.sender);
      return;
    }
    if (["info", "debug"].includes(GlobalInfo.logger)) this.log('adding', message.sender);

    this.peers.set(message.sender, new Connection({
      id: message.sender,
      rtcConfiguration: this.config,
      offer: message.signal === PeerSignalType.offer ? message.data as RTCSessionDescriptionInit : undefined,
      streams: this.media.streams,
      channels: this.media.channels,
    }));
  }

  remove(id: string) {
    const peer = this.peers.get(id);
    if (!peer) return;

    if (["info", "debug"].includes(GlobalInfo.logger)) this.log('removing', id);
    peer.close();
    this.peers.delete(id);
  }

  signal(message: PeerSignalMessage) {
    const { signal, data } = message;
    if (signal === PeerSignalType.offer) this.add(message);
    else
    {
      reactor.dispatch(`peer-${message.sender}-${signal}`, data);
    }
  }

  forward(message: TargetMessage, target: string) {
    const peer = this.peers.get(target);
    if (!peer)
    {
      if (GlobalInfo.logger !== "none") this.error("forward", "not found", target);
      return;
    }

    peer.systemsend(message);
  }

  send(channel: string, target: string, message: string): boolean {
    const peer = this.peers.get(target);

    if (!peer)
    {
      if (["warning", "debug"].includes(GlobalInfo.logger)) this.error("send", "peer not found");
      return false;
    }

    return peer.send(channel, message);
  }

  broadcast(channel: string, message: string) {
    this.peers.forEach(p => {
      p.send(channel, message);
    });
  }
}