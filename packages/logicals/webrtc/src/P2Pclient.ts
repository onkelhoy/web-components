// types
import { ID, UserInfo, Events, SetType, SparseUserInfo, PrintFunction, LogType, CustomErrorEvent } from 'types';
import { NetworkInfo, PartialNetworkInfo } from 'types/network';
import { SignalMessage } from 'types/peer.message';
import {
  JoinMessage,
  Message,
  MessageType,
  OutgoingMessageType,
  TargetMessage,
  TargetMessageSparse,
  TargetType
} from 'types/socket.message';

// modules
import { Socket } from 'socket';

// utils
import { Network } from 'utils/network'
import { Reactor } from 'utils/reactor';
import { GlobalInfo } from 'utils/global';
import { print, tryuntil } from "utils/helper";
import { PeerManager } from 'utils/manager';
import { MediaConfig, MediaType } from 'types/peer';

export type Settings = {
  printName?: string;
  network?: Partial<NetworkInfo>;
  forbiddenEvents?: string[];

  logLevel?: LogType;
  server?: string | URL; // use this for some public server 
  socket?: {
    url?: string | URL;
    protocols?: string | string[];
  };
  user?: SparseUserInfo;
  // NOTE good page for stun servers: 
  // https://ourcodeworld.com/articles/read/1536/list-of-free-functional-public-stun-servers-2021
  rtcConfiguration?: RTCConfiguration;
}

const reactor = new Reactor();
export class P2Pclient {
  // variables
  private network: Network;
  private manager: PeerManager;
  private error: PrintFunction;
  private log: PrintFunction;
  private socket!: Socket;
  private forbiddenEvents: string[];
  private currentState: string | null = null;

  constructor(settings: Settings) {

    this.log = print(settings.printName ?? "P2Pclient");
    this.error = print(settings.printName ?? "P2Pclient", "error");
    this.network = new Network(settings.network);

    GlobalInfo.logger = settings.logLevel || 'none';
    this.set(SetType.User, (settings.user || {}) as UserInfo);

    reactor.on(Events.Target, this.onTargetMessage);
    reactor.on(Events.SendTarget, this.sendTargetMessage);
    reactor.on(Events.PeerConnectionOpen, this.newConnection);
    reactor.on(Events.Error, this.handleError);
    reactor.on(Events.SocketOpen, this.handleSocketOpen);

    this.forbiddenEvents = settings.forbiddenEvents ?? [];

    this.manager = new PeerManager(settings.rtcConfiguration ?? {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    let serverurl = settings.server ?? !settings.socket?.url ? 'https://render-webrtc-signal-server.onrender.com' : undefined;

    this.currentState = "loading";
    if (serverurl) 
    {
      tryuntil("server-connection", async (attempts) => {
        this.log("server-connection", "trying to connect", { attempts });

        const res = await fetch(serverurl + "/network");
        const networks = await res.json();

        if (!Array.isArray(networks)) throw new Error("response is not of array")
      }, 10, this.error, 3000).then(() => {
        this.socket = new Socket(
          settings.socket?.url ?? serverurl as string,
          settings.socket?.protocols,
        );
      })
    }
    else if (settings.socket?.url)
    {
      this.socket = new Socket(
        settings.socket.url,
        settings.socket.protocols,
      );
    }
    else 
    {
      throw new Error("[P2Pclient] must have either socker.url or server in settings");
    }
  }

  // getters 
  get info() {
    return {
      user: GlobalInfo.user,
      logger: GlobalInfo.logger,
      network: GlobalInfo.network,
    };
  }

  get id() {
    return GlobalInfo.user.id;
  }

  get host() {
    return GlobalInfo.network?.host;
  }

  get state() {
    return this.currentState;
  }

  getPeerInfo(id: string) {
    return this.manager.peers.get(id)?.info;
  }

  // public functions
  public send(channel: string, to: ID, data: any) {
    const message = data instanceof Object ? JSON.stringify(data) : data;

    if (channel === "system") this.error("send", "forbidden channel");
    else this.manager.send(channel, to, message);
  }

  public broadcast(channel: string, data: any) {
    const message = data instanceof Object ? JSON.stringify(data) : data;

    if (channel === "system") this.error("send", "forbidden channel");
    else this.manager.broadcast(channel, message);
  }

  public on(event: string, callback: Function) {
    if (this.forbiddenEvents.includes(event)) return;
    reactor.on(event, callback);
  }

  public onMessage(channel: string, callback: (data: { id: string, message: any }) => void) {
    reactor.on(`${Events.PeerMessage}-${channel}`, callback);
  }

  public register(network: PartialNetworkInfo) {
    if (["info", "debug"].includes(GlobalInfo.logger)) this.log('register', network);
    this.socket.send({
      type: OutgoingMessageType.Register,
      network,
    } as Message);
  }

  public join(network: ID, config?: Record<string, any>) {
    this.sendTargetMessage({
      target: network,
      targetType: TargetType.Join,
      config,
    });
  }

  public set(type: SetType, data: any) {
    switch (type)
    {
      case SetType.User: {
        if (!GlobalInfo.user) GlobalInfo.user = data;
        else GlobalInfo.user = { ...(data || {}), id: GlobalInfo.user.id };

        if (["info", "debug"].includes(GlobalInfo.logger)) this.log("userinfo", GlobalInfo.user);
        break;
      }
      case SetType.Network: {
        // TODO update so network can have both host & id seperate 
        // and before updating we should check if we are host 
        reactor.dispatch(Events.NetworkUpdate, data);
        break;
      }
      case SetType.Media: {
        let type = MediaType.Data;
        let config: MediaConfig | undefined = undefined;

        if (typeof data === "object")
        {
          if ('type' in data) type = data.type;
          if ('config' in data) config = data.config;
        }
        else if (typeof data === "string")
        {
          if (["audio", "data", "screen", "video"].includes(data)) type = data as MediaType;
          else 
          {
            config = {
              label: data,
            };
          }
        }

        this.manager.media.add(type, config);
        break;
      }
      default: {
        if (["warning", "info", "debug"].includes(GlobalInfo.logger)) this.error("set", "unssuported type", type);
      }
    }
  }


  // private functions 
  private handleError = (error: CustomErrorEvent) => {
    if (error.type === "socket")
    {
      this.currentState = "socket-error";
    }
  }

  private handleSocketOpen = () => {
    this.currentState = "socket-connected";
  }

  private newConnection = (user: UserInfo) => {
    if (GlobalInfo.user.id !== GlobalInfo.network?.host)
    {
      this.socket.close();
    }
  }

  private forward(message: TargetMessage): boolean {
    if (this.network.registered) 
    {
      // forward to someone else (or target : based on Topology)
      const forward = this.network.forward(message);
      if (forward !== undefined)
      {
        this.manager.forward(message, forward);
        return true;
      }
      else if (["error", "warning", "debug"].includes(GlobalInfo.logger)) this.error("forward", "not found", message.target);
    }

    return false;
  }

  private sendTargetMessage = (sparsemessage: TargetMessageSparse) => {
    let message: TargetMessage;
    if (sparsemessage.type && sparsemessage.sender)
    {
      // its just a forward 
      message = sparsemessage as TargetMessage;
    }
    else
    {
      message = {
        ...sparsemessage,
        sender: GlobalInfo.user.id,
        type: MessageType.Target,
      };
    }

    if (["debug"].includes(GlobalInfo.logger)) this.log("send-target-message", message);

    // network or forward is null : thus socket transport
    if (!this.forward(message)) this.socket.send(message);
  }

  private onTargetMessage = (message: TargetMessage) => {
    if (["debug"].includes(GlobalInfo.logger)) this.log("on-target-message", message);

    if (message.target !== GlobalInfo.user.id)
    {
      if (this.forward(message)) return;
    }

    switch (message.targetType)
    {
      case TargetType.Join: {
        if (this.network.registered)
        {
          this.network.join(message as JoinMessage);
        }
        else this.error("network-join", "no network", message.target);
        break;
      }
      case TargetType.Reject: {
        this.log("join-request", "we got rejected");
        break;
      }
      case TargetType.Signal: {
        this.manager.signal(message as SignalMessage);
        break;
      }
      default: {
        this.error("target-message", "unsupported type", message.targetType);
        break;
      }
    }
  }
}