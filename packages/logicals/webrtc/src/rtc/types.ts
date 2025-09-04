import { UserInfo } from "types";
import { MessageType, TargetMessage, TargetMessageType } from "types.message";

export enum PeerSignalType {
  candidate = "candidate",
  offer = "offer",
  answer = "answer",
}
export type PeerSignalData = RTCIceCandidate | RTCSessionDescriptionInit;
export type PeerSignalMessage = TargetMessage & {
  type: MessageType.Target;
  targetType: TargetMessageType.Signal;
  signal: PeerSignalType;
  data: PeerSignalData;
  user: UserInfo;
}