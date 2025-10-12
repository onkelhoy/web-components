import { Meta, MessageType } from "./types";

export class Coder {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();


  // flags
  private static FLAG_HOPS = 1 << 0;
  private static FLAG_TTL = 1 << 1;
  private static FLAG_HOPLIMIT = 1 << 2;
  private static FLAG_RELAY = 1 << 3;

  // Helper to encode a string with uint16 length prefix
  private static encodeString(value: string) {
    const bytes = this.encoder.encode(value);
    if (bytes.length > 0xffff) throw new Error("String too long (>65535)");
    return { bytes, len: bytes.length };
  }

  /**
   * 
   * [uint16 sizeOfType][type]
   * [uint16 sizeOfSender][sender]
   * [uint16 sizeOfReceiver][receiver]
   * [timestamp uint64]
   * [uint16 sizeOfPayload][payload]
   * 
   * @param message 
   * @returns 
   */
  static Encode(message: MessageType): Uint8Array {
    const meta = message.meta;

    const typePart = this.encodeString(String(meta.type));
    const receiverPart = this.encodeString(meta.receiver);
    const senderPart = this.encodeString(meta.sender);
    const payloadStr = typeof message.payload === "string" ? message.payload : String(message.payload);
    const payloadBytes = this.encoder.encode(payloadStr);

    // hops
    let hopsParts: { bytes: Uint8Array; len: number }[] = [];
    if (meta.hops && meta.hops.length > 0)
    {
      hopsParts = meta.hops.map(h => {
        const enc = this.encodeString(h);
        return { bytes: enc.bytes, len: enc.len };
      });
    }

    // relay
    let relayPart: { bytes: Uint8Array; len: number } | null = null;
    if (meta.relay)
    {
      const enc = this.encodeString(meta.relay);
      relayPart = { bytes: enc.bytes, len: enc.len };
    }

    // compute flags
    let flags = 0;
    if (meta.hops && meta.hops.length > 0) flags |= this.FLAG_HOPS;
    if (typeof meta.ttl === "number") flags |= this.FLAG_TTL;
    if (typeof meta.hopLimit === "number") flags |= this.FLAG_HOPLIMIT;
    if (meta.relay) flags |= this.FLAG_RELAY;

    // Compute total length
    // 1 byte version + 1 byte flags
    let total = 1 + 1;
    // type
    total += 2 + typePart.len;
    // receiver
    total += 2 + receiverPart.len;
    // sender
    total += 2 + senderPart.len;
    // timestamp (uint64)
    total += 8;
    // hops
    if (flags & this.FLAG_HOPS)
    {
      total += 2; // hops count (uint16)
      for (const p of hopsParts) total += 2 + p.len;
    }
    // ttl
    if (flags & this.FLAG_TTL) total += 4;
    // hopLimit
    if (flags & this.FLAG_HOPLIMIT) total += 4;
    // relay
    if (flags & this.FLAG_RELAY && relayPart) total += 2 + relayPart.len;
    // payload length prefix (uint32) + payload
    total += 4 + payloadBytes.length;

    const buf = new Uint8Array(total);
    const view = new DataView(buf.buffer);
    let offset = 0;

    // version
    view.setUint8(offset, 1);
    offset += 1;

    // flags
    view.setUint8(offset, flags);
    offset += 1;

    // write helper for uint16 + bytes
    const writeUint16AndBytes = (b: Uint8Array) => {
      view.setUint16(offset, b.length, false); // big-endian
      offset += 2;
      buf.set(b, offset);
      offset += b.length;
    };

    // type
    writeUint16AndBytes(typePart.bytes);

    // receiver
    writeUint16AndBytes(receiverPart.bytes);

    // sender
    writeUint16AndBytes(senderPart.bytes);

    // timestamp as BigUint64 (ms)
    const ts = BigInt(meta.timestamp ?? Date.now());
    view.setBigUint64(offset, ts, false); // big-endian
    offset += 8;

    // hops
    if (flags & this.FLAG_HOPS)
    {
      view.setUint16(offset, hopsParts.length, false);
      offset += 2;
      for (const p of hopsParts)
      {
        writeUint16AndBytes(p.bytes);
      }
    }

    // ttl
    if (flags & this.FLAG_TTL)
    {
      view.setUint32(offset, meta.ttl ?? 0, false);
      offset += 4;
    }

    // hopLimit
    if (flags & this.FLAG_HOPLIMIT)
    {
      view.setUint32(offset, meta.hopLimit ?? 0, false);
      offset += 4;
    }

    // relay
    if (flags & this.FLAG_RELAY && relayPart)
    {
      writeUint16AndBytes(relayPart.bytes);
    }

    // payload len (uint32) + bytes
    view.setUint32(offset, payloadBytes.length, false);
    offset += 4;
    buf.set(payloadBytes, offset);
    offset += payloadBytes.length;

    // sanity
    if (offset !== total)
    {
      throw new Error(`Encode length mismatch: offset ${offset} != total ${total}`);
    }

    return buf;
  }

  // Decode Uint8Array -> MessageObject<MetaType>
  static Decode<MetaType = string>(data: Uint8Array): MessageType<MetaType, string> {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;

    const readUint8 = () => view.getUint8(offset++);
    const readUint16 = () => { const v = view.getUint16(offset, false); offset += 2; return v; };
    const readUint32 = () => { const v = view.getUint32(offset, false); offset += 4; return v; };
    const readBigUint64 = () => { const v = view.getBigUint64(offset, false); offset += 8; return v; };
    const readBytes = (len: number) => {
      const slice = new Uint8Array(view.buffer, view.byteOffset + offset, len);
      offset += len;
      return slice;
    };
    const readString = (len: number) => this.decoder.decode(readBytes(len));

    // version
    const version = readUint8();
    if (version !== 1) throw new Error(`Unsupported version ${version}`);

    // flags
    const flags = readUint8();

    // read type
    const typeLen = readUint16();
    const type = readString(typeLen);

    // receiver
    const receiverLen = readUint16();
    const receiver = readString(receiverLen);

    // sender
    const senderLen = readUint16();
    const sender = readString(senderLen);

    // timestamp
    const timestampBig = readBigUint64();
    const timestamp = Number(timestampBig); // may lose precision for extremely large BigInt, but ok for ms

    // hops
    let hops: string[] | undefined;
    if (flags & this.FLAG_HOPS)
    {
      const hopsCount = readUint16();
      hops = [];
      for (let i = 0; i < hopsCount; i++)
      {
        const l = readUint16();
        hops.push(readString(l));
      }
    }

    // ttl
    let ttl: number | undefined;
    if (flags & this.FLAG_TTL)
    {
      ttl = readUint32();
    }

    // hopLimit
    let hopLimit: number | undefined;
    if (flags & this.FLAG_HOPLIMIT)
    {
      hopLimit = readUint32();
    }

    // relay
    let relay: string | undefined;
    if (flags & this.FLAG_RELAY)
    {
      const rlen = readUint16();
      relay = readString(rlen);
    }

    // payload
    const payloadLen = readUint32();
    const payload = this.decoder.decode(readBytes(payloadLen));

    const meta: Meta<MetaType> = {
      type: type as MetaType,
      sender,
      receiver,
      timestamp,
      // only set optional fields if present
      ...(hops ? { hops } : {}),
      ...(typeof ttl === "number" ? { ttl } : {}),
      ...(typeof hopLimit === "number" ? { hopLimit } : {}),
      ...(relay ? { relay } : {}),
    } as Meta<MetaType>;

    return {
      meta,
      payload,
    };
  }
}