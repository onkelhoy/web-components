import { NetworkInfo, UserInfo } from "types";

export enum MessageType {
  Target = "target",
}
export type Message = Record<string, any> & {
  type: any;
}
export enum SystemMessageType {
  Target = "target",
  Init = "init",
  Connect = "connect",
}
export type SystemMessage = Message & {
  type: SystemMessageType;
}
export type SystemInitMessage = SystemMessage & {
  type: SystemMessageType.Init;
  user: UserInfo;
  network: NetworkInfo;
}
export type SystemConnectMessage = SystemMessage & {
  type: SystemMessageType.Connect;
  target: string;
}
export enum TargetMessageType {
  Join = "join",
  Reject = "reject",
  Signal = "signal",
}
export type TargetMessageSparse = Omit<Message, 'type'> & {
  targetType: TargetMessageType;
  target: string;
}
export type TargetMessage = TargetMessageSparse & {
  type: MessageType.Target;
  sender: string;
}