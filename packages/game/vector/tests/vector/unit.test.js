import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { Vector } from '@papit/game-vector';

describe('@papit/game-vector unit tests', () => {
  // beforeEach(() => console.log('about to run a test'));

  it('construction test (zero based)', () => {
    const a = new Vector(0, 0);
    const zeroVectors = [
      Vector.Zero,
      Vector.toVector(0, 0, 0),
      new Vector({ x: 0, y: 0 }),
    ];

    for (let v of zeroVectors) {
      assert.strictEqual(a.x, v.x);
      assert.strictEqual(a.y, v.y);
      assert.strictEqual(a.z, v.z);
    }
  });
});