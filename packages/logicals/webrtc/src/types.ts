
export enum Events {
  Error = "error",
  SocketOpen = "socket-open",
  Target = "target",
  SendTarget = "send-target",
  NetworkUpdate = 'network',
  NewStream = 'new-stream',
  NewDataChannel = 'new-data-channel',
  IncommingMedia = 'incomming-media',
  PeerAdd = 'pre-add-peer',
  PeerDelete = 'delete-peer',
  PeerConnectionOpen = 'add-peer',
  PeerMessage = 'peer-message', // onMessage
}

export enum EventErrorType {
  Socket = "socket",
}
export type EventError = {
  type: EventErrorType;
  reason: string;
}

// everything you'd like goes here (updatable)
export type SparseUserInfo = Record<string, any>;
export type UserInfo = SparseUserInfo & {
  id: string;
}

export type PeerType = "calling" | "receiving";

export type PartialNetworkInfo = Record<string, any> & {
  limit?: number;
  current?: number;
  name?: string;
}

// required fields
export type NetworkInfo = PartialNetworkInfo & {
  id: string;
  host: string;
}
