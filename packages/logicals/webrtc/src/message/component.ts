import { MetaMessage } from "@papit/meta-message";
import { MessageType, Meta } from "./types";


export class Message<MetaType = string, Payload = any> extends MetaMessage<Meta<MetaType>, Payload> {

  // static FromBinary<MetaType = string, Payload = any>(data: Uint8Array<ArrayBufferLike>, parsePayload?: boolean): Message<Meta<MetaType>, Payload> {
  //   return MetaMessage.FromBinary<MetaMessage<Meta<MetaType>, Payload>, Meta<MetaType>, Payload>(data, parsePayload);
  // }
}
const m = Message.FromBinary<"hello">(new Uint8Array());
m.meta.

// export class Message<MetaType = string, Payload = any> extends MetaMessage<Meta<MetaType>,> {
//   private parsed = false;
//   private binary:Uint8Array<ArrayBufferLike>|undefined = undefined;
//   constructor(
//     public meta: Meta<MetaType>,
//     public payload: Payload | AllowSharedBufferSource,
//   ) { }

//   public toBinary(force?: boolean) {
//     if (force) this.binary = undefined;
//     if (!this.binary) this.binary = Codec.Encode<MetaType, Payload | AllowSharedBufferSource>(this);

//     return this.binary;
//   }

//   public parse<T extends Payload = Payload>(): T {
//     if (this.parsed) return this.payload as T;
//     this.parsed = true;

//     let payload = this.payload;

//     // Only parse if payload is a buffer type
//     if (payload instanceof Uint8Array || payload instanceof ArrayBuffer || ArrayBuffer.isView(payload))
//     {
//       this.payload = Codec.Parse<T>(payload);
//     } else
//     {
//       // Already parsed, just cast it
//       this.payload = payload as T;
//     }

//     return this.payload as T;
//   }

//   static Create<MetaType = string, Payload = Object | string>(meta: Partial<Meta<MetaType>> & { type: MetaType }, payload: Payload) {
//     return new Message<MetaType, Payload>(
//       {
//         sender: "",
//         receiver: "",
//         timestamp: Date.now(),
//         ...(meta),
//       },
//       payload,
//     );
//   }

//   static FromBinary<MetaType = string, Payload = any>(data: Uint8Array<ArrayBufferLike>, parsePayload?: boolean) {
//     const message = Codec.Decode<MetaType, Payload>(data, parsePayload);

//     const msg = new Message(message.meta, message.payload);
//     msg.parsed = !!parsePayload;
//     return msg;
//   }
// }