// types 
import { Events, NetworkInfo, UserInfo } from "types";
import { SystemMessageType, TargetMessage, TargetMessageType } from "types.message";

// utils
import { Reactor } from "utils/reactor";
import { Logger } from "utils/logger";
import { GlobalInfo } from "utils/global";

// local
import type { NetworkJoinMessage, RouterInfo } from "./types";

const reactor = new Reactor();
export class Network {
  private router: Map<string, RouterInfo>;
  private log = Logger("network");

  constructor(info?: Partial<NetworkInfo>) {
    this.router = new Map();
    reactor.on(Events.NetworkUpdate, this.update);
    reactor.on(Events.PeerConnectionOpen, this.newpeer);
    reactor.on(Events.PeerDelete, this.removepeer);

    if (info !== undefined) 
    {
      GlobalInfo.network = {
        id: GlobalInfo.user.id,
        host: GlobalInfo.user.id,
        ...info,
      };
    }
  }

  get Info() {
    return GlobalInfo.network;
  }

  update = (info: Partial<NetworkInfo>) => {
    GlobalInfo.network = {
      ...info,
      host: (GlobalInfo.network?.host ?? info.host) as string,
      id: (GlobalInfo.network?.id ?? info.id) as string,
    };
    if (["info", "debug"].includes(GlobalInfo.logger)) this.log("update", GlobalInfo.network);
  }

  private newpeer = (peer: UserInfo) => {
    this.router.set(peer.id, {
      connection: [GlobalInfo.user.id],
      type: peer.type,
    });

    // make sure this new peer gets our connection to establish a mesh network

    // NOTE this will cause them to later send your id to others
    this.router.forEach((_info, id) => {
      // NOTE this means when disconnect we need to remove all references - dont like this
      if (id !== peer.id)
      {
        // this.router.set(id, { 
        //   ...info,
        //   connection: [...info.connection, peer.id]
        // });

        reactor.dispatch(`peer-${id}-system-send`, {
          type: SystemMessageType.Connect,
          target: peer.id,
        });
      }
    });
  }

  removepeer = (peer: string) => {
    this.router.delete(peer);
  }

  private get password() {
    return GlobalInfo.network?.password;
  }

  get registered() {
    return GlobalInfo.network !== undefined;
  }


  forward(message: TargetMessage): string | undefined {
    const target = this.router.get(message.target);
    if (target) return message.target;

    // NOTE check if we can be connected to this target via another peer ?

    if (GlobalInfo.user.id === GlobalInfo.network?.host)
    {
      return undefined;
    }
    else
    {
      // right now we just fallback to host
      return GlobalInfo.network?.host;
    }
  }

  connect(message: TargetMessage) {
    // NOTE we now have the power to determine who in our network should connect to this peer
    // for now it will always be us 

    reactor.dispatch(Events.PeerAdd, message);
  }

  join(message: NetworkJoinMessage) {
    if (this.router.has(message.target))
    {
      if (["info", "debug"].includes(GlobalInfo.logger)) this.log("join", "we already have the connection");
      return;
    }

    const { config } = message;
    const pass = this.password;

    if (!pass || pass === config?.password)
    {
      this.connect(message as TargetMessage);
    }
    else
    {
      reactor.dispatch(Events.SendTarget, {
        targetType: TargetMessageType.Reject,
        target: message.sender,
      });
    }
  }

  // Expose size of connected peers (including self if needed)
  get size() {
    return this.router.size;
  }
}