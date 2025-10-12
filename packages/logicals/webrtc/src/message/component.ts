import { Coder } from "./coder";
import { Meta } from "./types";

export class Message<MetaType, Payload> {
  constructor(
    public meta: Meta<MetaType>,
    public payload: Payload | string,
  ) { }

  static Create<MetaType = string, Payload = Object | string>(meta: Partial<Meta<MetaType>> & { type: MetaType }, payload: Payload) {
    return new Message<MetaType, Payload>(
      {
        sender: "",
        receiver: "",
        timestamp: Date.now(),
        ...(meta),
      },
      payload,
    );
  }

  static From<MetaType = string>(data: Uint8Array<ArrayBufferLike>, parsePayload?: boolean) {
    const message = Coder.Decode<MetaType>(data);
    return new Message(message.meta, parsePayload ? JSON.parse(message.payload) : message.payload);
  }
}