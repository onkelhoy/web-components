import { MessageType } from "./types";
export declare class Codec {
    private static encoder;
    private static decoder;
    static Parse<Payload>(payload: AllowSharedBufferSource): Payload;
    static Encode<Meta extends Object = object, Payload = string>(message: MessageType<Meta, Payload>): Uint8Array;
    static Decode<Meta extends Object = object, Payload = any>(data: Uint8Array, parsePayload?: boolean): MessageType<Meta, Payload | AllowSharedBufferSource>;
}
