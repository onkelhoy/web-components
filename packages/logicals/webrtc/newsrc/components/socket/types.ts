import { NetworkInfo } from "../network";

// INCOMING
export type IncommingSocketMessage =
  | TargetMessage
  | ConnectionMessage
  | NetworkRegisterMessage
  | NetworkUpdateMessage
  | ErrorMessage;

type TargetMessage = {
  type: "target";
  target: string;
};
type ConnectionMessage = {
  type: "socket-connection-ack";
  id: string;
};
type NetworkRegisterMessage = {
  type: "network-register-ack";
  network: NetworkInfo;
};
type NetworkUpdateMessage = {
  type: "network-update-ack";
  network: NetworkInfo;
};
type ErrorMessage = {
  type: "error";
  error: string;
};

// OUTGOING 
export type OutgoingSocketMessage =
  | OutgoingNetworkRegisterMessage
  | OutgoingNetworkUpdateMessage;

type OutgoingNetworkRegisterMessage = {
  type: "network-register";
  network: NetworkInfo;
}
type OutgoingNetworkUpdateMessage = {
  type: "network-update";
  network: NetworkInfo;
}

export const MESSAGE_TYPE_MAP = {
  "target": "target",
  "socket-connection-ack": "id",
  "network-register-ack": "network",
  "network-update-ack": "network",
}
export const MAX_ATTEMPTS = 10;
export const RECONNECT_TIME_INTERVAL_STEP = 700; // with attempt=10 => 1400 (total time = 10850)

