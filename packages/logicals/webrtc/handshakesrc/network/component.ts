import { NetworkMessage } from "./types";

export class Network extends EventTarget {
  public send(message: NetworkMessage) {
    console.trace({ message });
  }
}