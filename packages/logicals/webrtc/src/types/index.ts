export type ID = string;
export type LogType = 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'none';
export type PrintFunction = (type: string, ...args: any[]) => void;

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

export type CustomErrorEvent = {
  type: "socket";
  reason: string;
}

export enum SetType {
  User = 'user',
  Network = 'network',
  Media = "media",
}

// everything you'd like goes here (updatable)
export type SparseUserInfo = Record<string, any>;
export type UserInfo = SparseUserInfo & {
  id: ID;
}