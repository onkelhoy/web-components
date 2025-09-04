import { PeerType } from "types";
import { Message, MessageType, TargetMessage, TargetMessageType } from "types.message";

export type RouterInfo = {
  connection: string[];
  type: PeerType;
}

export type NetworkJoinMessage = TargetMessage & {
  targetType: TargetMessageType.Join;
  config?: Record<string, any>;
}

// outgoing messages 
export enum SocketIncomingMessageType {
  Error = "error",
  ConnectionACK = "socket-connection-ack",
  RegisterACK = "network-register-ack",
  UpdateACK = "network-update-ack",
}
export type SocketIncomingMessage = Message & {
  type: SocketIncomingMessageType | MessageType;
}
// export type NetworkMessage = SocketIncomingMessage & {
//   network: NetworkInfo;
// }
export type SocketErrorMessage = SocketIncomingMessage & {
  error: string;
}

// incomming messages
export enum SocketOutgoingMessageType {
  Register = "network-register",
  Update = "network-update",
}
export type SocketOutgoingMessage = Message & {
  type: SocketOutgoingMessageType | MessageType;
}