import { ID, UserInfo } from ".";
import { NetworkInfo } from "./network";
import { Message, MessageType, TargetMessage, TargetType } from "./socket.message";

// signaling 
export enum SignalType {
  candidate = "candidate",
  offer = "offer",
  answer = "answer",
}
export type SignalData = RTCIceCandidate | RTCSessionDescriptionInit;
export interface SignalMessage extends TargetMessage {
  type: MessageType.Target;
  targetType: TargetType.Signal;
  signal: SignalType;
  data: SignalData;
  user: UserInfo;
}

export enum SystemType {
  Target = "target",
  Init = "init",
  Connect = "connect",
}
export interface SystemMessage extends Message {
  type: SystemType;
}
export interface SystemInitMessage extends SystemMessage {
  type: SystemType.Init;
  user: UserInfo;
  network: NetworkInfo;
}
export interface ConnectMessage extends SystemMessage {
  type: SystemType.Connect;
  target: ID;
}