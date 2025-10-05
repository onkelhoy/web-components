type HandshakeMessage =
  | HandshakeIceMessage
  | HandshakeAnswerMessage
  | HandshakeOfferMessage;

type HandshakeIceMessage = {
  type: "handshake";
  handshake: "ice";
  ice: RTCIceCandidate;
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

type SystemMessage =
  | HandshakeMessage;

type DispatchErrorFunction = (type: string, error: string, payload?: any) => void;

export function setup(channel: RTCDataChannel, dispatchError: DispatchErrorFunction) {
  channel.addEventListener("close", (event: Event) => {
    // disconnected?
  });

  channel.addEventListener("open", (event: Event) => {
    // connection 
  });

  channel.addEventListener("error", (event: RTCErrorEvent) => {
    // whats going on?
    console.log('system error', event);
  });

  channel.addEventListener("message", (event: MessageEvent) => {
    const message = JSON.parse(event.data) as SystemMessage;

    switch (message.type)
    {
      case "handshake":
        return void Handshake(message, channel, dispatchError);
      default:
        dispatchError("system", "incorrect system message type received", message);
        break;
    }
  });
}

function Handshake(message: HandshakeMessage, channel: RTCDataChannel, dispatchError: DispatchErrorFunction) {
  switch (message.handshake)
  {
    case "ice":
      break;
    case "answer":
      break;
    case "offer":
      break;
    default:
      dispatchError("system", "incorrect handshake type received", message);
      break;
  }
}