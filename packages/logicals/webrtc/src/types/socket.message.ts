import { ID } from '.';
import { NetworkInfo } from './network';

export enum MessageType {
  Target = "target",
}
export interface Message extends Record<string, any> {
  type: any;
}

// target message 
export enum TargetType {
  Join = "join",
  Reject = "reject",
  Signal = "signal",
}
export interface TargetMessageSparse extends Omit<Message, 'type'> {
  targetType: TargetType;
  target: ID;
}
export interface TargetMessage extends TargetMessageSparse {
  type: MessageType.Target;
  sender: ID;
}
export interface JoinMessage extends TargetMessage {
  targetType: TargetType.Join;
  config?: Record<string, any>;
}

// outgoing messages 
export enum IncomingMessageType {
  Error = "error",
  ConnectionACK = "socket-connection-ack",
  RegisterACK = "network-register-ack",
  UpdateACK = "network-update-ack",
}
export interface IncomingMessage extends Message {
  type: IncomingMessageType | MessageType;
}
export interface NetworkMessage extends IncomingMessage {
  network: NetworkInfo;
}
export interface ErrorMessage extends IncomingMessage {
  error: string;
}

// incomming messages
export enum OutgoingMessageType {
  Register = "network-register",
  Update = "network-update",
}
export interface OutgoingMessage extends Message {
  type: OutgoingMessageType | MessageType;
}