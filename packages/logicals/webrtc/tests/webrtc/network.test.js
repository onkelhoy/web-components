import {describe, it, before} from 'node:test';
import assert from 'node:assert';

import {Network, Global} from '@papit/webrtc';

before(() => {
  Global.user = {id: '0'};
});

describe("Network Tests", () => {
  it("creation", () => {
    const network = new Network({id: '0', name: 'test'});
    assert.strictEqual(network.Info?.id, '0');
  });

  it("update", () => {
    const network = new Network({id: '0', name: 'test'});
    network.update({hello: 'world'});
    assert.strictEqual(network.Info?.hello, 'world');
  });

  it("update network id should not be successful", () => {
    const network = new Network({id: '0', name: 'test'});
    network.update({id: 'world'});
    assert.strictEqual(network.Info?.id, '0');
  });

  it("should accept new connection via join()", () => {
    const network = new Network({id: '0', name: 'test'});
    network.join({sender: '1', target: '1'});
    assert.strictEqual(network.size, 2); // self + peer
  });

  it("should not add duplicate peer", () => {
    const network = new Network({id: '0', name: 'test'});
    network.join({sender: '1', target: '1'});
    network.join({sender: '1', target: '1'});
    assert.strictEqual(network.size, 2); // still self + peer
  });

  it("should add multiple peers", () => {
    const network = new Network({id: '0', name: 'test'});
    network.join({sender: '1', target: '1'});
    network.join({sender: '2', target: '2'});
    assert.strictEqual(network.size, 3); // self + 2 peers
  });

  it("should be able to join & leave", () => {
    const network = new Network({id: '0', name: 'test'});
    network.join({sender: '1', target: '1'});
    network.removepeer('1');
    assert.strictEqual(network.size, 1); // self only
  });
});
