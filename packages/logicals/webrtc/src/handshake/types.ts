// internal to handshake system 
export type Message =
  | AnswerMessage
  | OfferMessage
  | CandidateMessage;

// external like in a socket or relay-peer 
export type HandshakeMessage = {
  type: "handshake";
  payload: Message;
}

type AnswerMessage = {
  type: "answer";
  description: RTCSessionDescriptionInit;
}
type OfferMessage = {
  type: "offer";
  description: RTCSessionDescriptionInit;
}
type CandidateMessage = {
  type: "candidate";
  candidate: RTCIceCandidate;
}