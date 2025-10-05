import { MediaSettings as MediaSettingsOriginal } from "../media";

export type Settings = {
  configuration: RTCConfiguration | undefined;
  caller: boolean | undefined;
}

export type StreamSettings = Exclude<MediaSettingsOriginal, { type: 'data' }>;
export type MediaSettings = StreamSettings | Omit<Extract<MediaSettingsOriginal, { type: 'data' }>, 'channel'>;


type HandshakeMessage =
  | HandshakeIceMessage
  | HandshakeAnswerMessage
  | HandshakeOfferMessage;

type HandshakeIceMessage = {
  type: "handshake";
  handshake: "ice";
  candidate: RTCIceCandidate;
}
type HandshakeAnswerMessage = {
  type: "handshake";
  handshake: "answer";
  answer: RTCSessionDescriptionInit;
}
type HandshakeOfferMessage = {
  type: "handshake";
  handshake: "offer";
  answer: RTCSessionDescriptionInit;
}

export type SystemMessage =
  | HandshakeMessage;