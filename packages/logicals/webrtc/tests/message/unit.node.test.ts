import { describe, it, before } from 'node:test';
import assert from 'node:assert';

import { Coder } from "../../src/message/coder.js";
import { MessageType } from '../../src/message/types.js';

describe("coder unit tests", () => {

  it("should encode a message into its simplest form", () => {
    const message: MessageType = {
      meta: {
        receiver: "bengt",
        sender: "sören",
        type: "something",
        timestamp: Date.now(),
      },
      payload: "payload",
    };

    const encoded = Coder.Encode(message);
    assert.ok(encoded instanceof Uint8Array);
    assert.ok(encoded.byteLength > 0);

    // Decode
    const decoded = Coder.Decode(encoded);

    // Check fields
    assert.strictEqual(decoded.meta.receiver, message.meta.receiver);
    assert.strictEqual(decoded.meta.sender, message.meta.sender);
    assert.strictEqual(decoded.meta.type, message.meta.type);
    assert.strictEqual(decoded.payload, message.payload);
  });

  it("should encode a message with all extra", () => {
    const message: MessageType = {
      meta: {
        receiver: "bengt",
        sender: "sören",
        type: "something",
        hopLimit: 520,
        hops: ["sören", "göran", "lennart", "sigvart"],
        relay: "sigvart",
        ttl: 4200,
        timestamp: Date.now(),
      },
      payload: "payload",
    };

    const encoded = Coder.Encode(message);
    assert.ok(encoded instanceof Uint8Array);
    assert.ok(encoded.byteLength > 0);

    // Decode
    const decoded = Coder.Decode(encoded);

    // Check fields
    assert.strictEqual(decoded.meta.receiver, message.meta.receiver);
    assert.strictEqual(decoded.meta.sender, message.meta.sender);
    assert.strictEqual(decoded.meta.type, message.meta.type);
    assert.strictEqual(decoded.meta.hopLimit, message.meta.hopLimit);
    assert.strictEqual(decoded.meta.relay, message.meta.relay);
    assert.strictEqual(decoded.meta.ttl, message.meta.ttl);
    assert.strictEqual(decoded.meta.hops?.length, message.meta.hops?.length);
    assert.strictEqual(decoded.payload, message.payload);
  });


  it("message reading should be faster then JSON.parse/stringify", () => {
    const message: MessageType = {
      meta: {
        receiver: "bengt",
        sender: "sören",
        type: "something",
        timestamp: Date.now(),
      },
      payload: {
        a: "3",
        b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b2: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b3: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b4: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b5: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b6: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b7: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b8: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b9: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b10: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b11: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b12: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b13: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b14: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b15: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b16: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b17: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b18: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b19: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b20: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b21: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b22: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b23: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b24: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b25: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b26: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b27: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b28: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b29: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
        b30: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: { b: { a: { b: { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } } },
      },
    };

    function Compare(message: MessageType) {
      let coderTotal = 0;
      let jsonTotal = 0;
      for (let i = 0; i < 10_000; i++)
      {
        let start = performance.now();
        const encoded = Coder.Encode(message);
        Coder.Decode(encoded);
        coderTotal += performance.now() - start;

        start = performance.now();
        const stringified = JSON.stringify(message);
        JSON.parse(stringified);
        jsonTotal += performance.now() - start;
      }

      return {
        coder: coderTotal / 10_000,
        json: jsonTotal / 10_000,
      };
    }

    const large = Compare(message);
    assert.ok(large.coder < large.json);
    console.log(large);


    // message.payload = "payload";
    // const small = Compare(message);
    // const result = small.coder - small.json;
    // assert.ok(small.coder > small.json);
    // assert.ok(small.coder > small.json);

  });
});