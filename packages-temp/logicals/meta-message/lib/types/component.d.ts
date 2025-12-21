import { MessageType } from "./types";
export declare class MetaMessage<Meta extends Object = object, Payload = any> implements MessageType<Meta, Payload | AllowSharedBufferSource> {
    meta: Meta;
    payload: Payload | AllowSharedBufferSource;
    private parsed;
    private binary;
    constructor(meta: Meta, payload: Payload | AllowSharedBufferSource);
    toBinary(force?: boolean): Uint8Array<ArrayBufferLike>;
    parse<T extends Payload = Payload>(): T;
    static Create<This extends new (meta: any, payload: any) => MetaMessage<any, any>, Meta extends Object = object, Payload = Object | string>(this: This, meta: Meta, payload: Payload): InstanceType<This>;
    static FromBinary<This extends new (meta: any, payload: any) => MetaMessage<any, any>, Meta extends Object = object, Payload = any>(this: This, data: Uint8Array<ArrayBufferLike>, parsePayload?: boolean): InstanceType<This>;
}
