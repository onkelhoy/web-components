import { Codec } from "./codec";
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
    const message = Codec.Decode<MetaType>(data, parsePayload);
    return new Message(message.meta, message.payload);
  }
}