export type Settings = {
  ttl?: number;
  hopLimit?: number;
  host: string;
  password?: string;
  limit?: number;
}

type BareNetworkMessage = {
  sender: string;
  receiver: string;
  hops?: string[];
  ttl?: number;
  hopLimit?: number;
  relay?: string;
}

export type NetworkInternalMessage =
  | NetworkJoin
  | NetworkLeave
  | NetworkUpdate;

type NetworkJoin = BareNetworkMessage & {
  type: "network";
  payload: {
    event: "join";
  }
}
type NetworkLeave = BareNetworkMessage & {
  type: "network";
  payload: {
    event: "leave";
  }
}
type NetworkUpdate = BareNetworkMessage & {
  type: "network";
  payload: {
    event: "update";
  }
}

export type NetworkMessage =
  | NetworkInternalMessage
  | BareNetworkMessage & {
    type: Exclude<string, "network">;
    payload: any;
  };