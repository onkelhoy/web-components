// import { Reactor } from "../utils/reactor";
// import { Events, string, LogFunction, UserInfo } from "../types";
// import { DataChannelConfig, MediaType, Settings, PeerType } from "../types/peer";
// import { ConnectMessage, SignalData, PeerSignalMessage, PeerSignalType, SystemInitMessage, SystemMessage, SystemMessageType } from "../types/peer.message";
// import { Message, MessageType, TargetMessageType } from "../types/socket.message";
// import { print, trycatch, tryuntil } from "../utils/helper";
// import { GlobalInfo } from "../utils/global";

// types
import { Events, PeerType, UserInfo } from "types";
import { Message, MessageType, SystemConnectMessage, SystemInitMessage, SystemMessage, SystemMessageType, TargetMessageType } from "types.message";

// utils
import { LogFunction, Logger } from "utils/logger";
import { Reactor } from "utils/reactor";
import { GlobalInfo } from "utils/global";
import { trycatch, tryuntil } from "utils/helper";

// media
import { DataChannelConfig, MediaType } from "media/types";

// locals
import { PeerSignalData, PeerSignalMessage, PeerSignalType } from "./types";

const reactor = new Reactor();
export type Settings = {
  id: string;
  rtcConfiguration?: RTCConfiguration;
  offer?: RTCSessionDescriptionInit;

  streams: Map<Omit<MediaType, 'data'>, MediaStream>; // CURRENTLY NOT USED!
  channels: Map<string, RTCDataChannelInit | undefined>;
}

// TODO add propper documentation
export class Connection {
  public id: string;
  private type: PeerType;
  private connection!: RTCPeerConnection;
  private log: LogFunction;
  private printerror: LogFunction;
  private userinfo!: UserInfo;
  private channels: Map<string, RTCDataChannel>;
  private pendingCandidates: RTCIceCandidate[] = [];

  constructor(settings: Settings) {
    this.id = settings.id;
    this.type = settings.offer ? "receiving" : "calling";
    this.printerror = Logger(`PEER#${this.id}`, 'error');
    this.log = Logger(`PEER#${this.id}`);
    this.channels = new Map();

    this.connection = new RTCPeerConnection(settings.rtcConfiguration);
    this.connection.onicecandidate = (event) => {
      if (event.candidate)
      {
        // transport this message to corresponding peer
        this.signal(PeerSignalType.candidate, event.candidate);
      }
    }
    this.connection.onicecandidateerror = (event) => {
      this.printerror("candidate", event);
    }
    // NOTE this will handle reconnection and trigger offer with iceRestart as option
    this.connection.oniceconnectionstatechange = () => {
      if (this.connection.iceConnectionState === "failed" && this.type === "calling")
      {
        this.createOffer(false);
      }
      else if (this.connection.iceConnectionState === "disconnected")
      {
        reactor.dispatch(Events.PeerDelete, this.id);
      }
    }

    reactor.on(Events.NewDataChannel, (config: DataChannelConfig) => this.addChannel(config.label, config.dataChannelDict))
    reactor.on(`peer-${this.id}-candidate`, this.reveiceCandidate);
    reactor.on(`peer-${this.id}-answer`, this.receiveAnswer);
    reactor.on(`peer-${this.id}-system-send`, this.systemsend);
    this.connection.ondatachannel = e => {
      this.setupChannel(e.channel);

      reactor.dispatch(Events.IncommingMedia, {
        type: MediaType.Data,
        config: { label: e.channel.label }
      });
    }

    if (this.type === "calling")
    {
      // create an offer
      this.createOffer();
      settings.channels.forEach((config, label) => {
        this.addChannel(label, config);
      });
    }
    else
    {
      // create an answer
      this.createAnswer(settings.offer as RTCSessionDescriptionInit);
    }
  }

  public close() {
    this.connection.close();
  }

  public get info() {
    return this.userinfo;
  }

  //#region handshake
  private reveiceCandidate = (candidate: RTCIceCandidate) => {
    tryuntil("receive-candidate", async () => {
      if (!this.connection.remoteDescription)
      {
        this.pendingCandidates.push(candidate);
        return;
      }
      await this.connection.addIceCandidate(candidate)
    }, 3, this.printerror);
  }
  private receiveAnswer = (answer: RTCSessionDescriptionInit) => {
    tryuntil("receive-answer", async () => {
      await this.connection.setRemoteDescription(answer);

      // process any queued candidates
      this.pendingCandidates.forEach(c => this.connection.addIceCandidate(c).catch(this.printerror));
      this.pendingCandidates = [];
    }, 3, this.printerror);
  }
  private createOffer(first = true) {
    tryuntil("create-offer", async () => {
      let options: RTCOfferOptions | undefined = undefined;
      if (!first) options = { iceRestart: true };
      const offer = await this.connection.createOffer(options);
      await this.connection.setLocalDescription(offer);

      this.signal(PeerSignalType.offer, offer);
    }, 3, this.printerror);
  }
  private createAnswer(offer: RTCSessionDescriptionInit) {
    tryuntil("create-answer", async () => {
      await this.connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);
      this.signal(PeerSignalType.answer, answer);
    }, 3, this.printerror);
  }
  //#endregion

  //#region send methods
  private signal(type: PeerSignalType, data: PeerSignalData) {
    reactor.dispatch(Events.SendTarget, {
      signal: type,
      type: MessageType.Target,
      target: this.id,
      targetType: TargetMessageType.Signal,
      data,
      user: GlobalInfo.user,
    } as PeerSignalMessage);
  }
  public onSignal(message: PeerSignalMessage) {
    const { signal, data } = message
    switch (signal)
    {
      case PeerSignalType.candidate: {
        tryuntil("signal-candidate", async () => {
          await this.connection.addIceCandidate(data as RTCIceCandidate);
        }, 3, this.printerror);
        break;
      }
      case PeerSignalType.answer: {
        trycatch("signal-answer", async () => {
          const remoteDesc = new RTCSessionDescription(data as RTCSessionDescriptionInit);
          await this.connection.setRemoteDescription(remoteDesc);
        }, this.printerror);
        break;
      }
      default:
        if (["error", "debug"].includes(GlobalInfo.logger)) this.printerror("signaling", `incorrect signaling type::${signal}`);
    }
  }
  public send(label: string, message: string): boolean {
    const channel = this.channels.get(label)
    if (!channel)
    {
      if (["warning", "debug"].includes(GlobalInfo.logger)) this.printerror("send", "cant find channel", label);
      return false;
    }

    channel.send(message);
    return true;
  }
  //#endregion

  //#region data-channel
  private addChannel(label: string, config?: RTCDataChannelInit) {
    if (this.channels.has(label))
    {
      // NOTE this is most likly caused when another peer creates it
      if (["debug"].includes(GlobalInfo.logger)) this.printerror("data-channel-add", "duplicate channel");
      return;
    }

    const channel = this.connection.createDataChannel(label, config);
    this.setupChannel(channel);
  }
  private setupChannel(channel: RTCDataChannel) {
    // NOTE its going to circle around twice (onDataChannel [->here] -> media.add -> newDataChannel -> here) see: 2x here
    if (this.channels.get(channel.label))
    {
      return;
    }
    channel.onopen = () => {
      if (channel.label === 'system')
      {
        this.systemopen();
      }
      else if (["info", "debug"].includes(GlobalInfo.logger)) this.log('channel-open', channel.label);
    }
    if (channel.label === "system")
    {
      channel.onmessage = this.systemmessage;
    }
    else
    {
      channel.onmessage = (e) => {
        reactor.dispatch(`${Events.PeerMessage}-${channel.label}`, { id: this.id, message: e.data })
      }
    }
    channel.onerror = (e) => {
      // do something
      console.error("[PEER] channel error", e);
    }

    this.channels.set(channel.label, channel);
  }
  //#endregion

  //#region system-data-chanel
  public systemsend = (message: Message): boolean => {
    const channel = this.channels.get('system');
    if (!channel)
    {
      if (["fatal", "error", "warning", "debug"].includes(GlobalInfo.logger)) this.printerror('system-send', 'channel not found');
      return false;
    }

    channel.send(JSON.stringify(message));
    return true;
  }
  private systemmessage = (event: MessageEvent) => {
    const message: SystemMessage = JSON.parse(event.data);
    switch (message.type)
    {
      case SystemMessageType.Target: {
        reactor.dispatch(Events.Target, message);
        break;
      }
      case SystemMessageType.Init: {
        const { user, network } = message as SystemInitMessage;
        if (network && (!GlobalInfo.network || GlobalInfo.network?.host === user.id))
        {
          reactor.dispatch(Events.NetworkUpdate, network);
        }
        reactor.dispatch(Events.PeerConnectionOpen, { ...user, type: this.type });
        this.userinfo = user;
        break;
      }
      case SystemMessageType.Connect: {
        const { target } = message as SystemConnectMessage;
        const smsg = {
          sender: target
        } as PeerSignalMessage;
        reactor.dispatch(Events.PeerAdd, smsg);
        break;
      }
      default: {

      }
    }
  }
  private systemopen() {
    // exchange info 
    this.systemsend({
      type: SystemMessageType.Init,
      user: GlobalInfo.user,
      network: GlobalInfo.network,
    } as SystemInitMessage);

    if (this.type === "calling")
    {
      // reactor.dispatch()
    }

    if (["info", "debug"].includes(GlobalInfo.logger)) this.log('connection', 'established');
  }
  //#endregion
}