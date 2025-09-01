import {describe, it, after, before} from 'node:test';
import assert from 'node:assert';

import {Controller, wait} from '@papit/webrtc';

import * as mockserver from './mockserver';

const nopeersconfig = {
  socket: {
    url: "ws://localhost:8000"
  },
  testing: {
    peers: false
  }
}

//#region ############ SETUP #####################

before(() => {
  mockserver.setup(8000);
});

after(() => {
  mockserver.teardown();
});

describe("Controller Tests", () => {
  let clientA;
  before(() => {
    clientA = new Controller(nopeersconfig);
  });

  it("should create a network", async () => {
    clientA.register({name: 'bananas'});
    await wait();
    assert.strictEqual(clientA.UserInfo.id, '0');
    // assert.strictEqual(clientA.network?.Info).toHaveProperty("name", "bananas");
    // assert.strictEqual(clientA.network?.Host).toHaveProperty(clientA.UserInfo.id);
  });

  it("another client should connect to this network", async () => {
    const clientB = new Controller(nopeersconfig);
    await wait();
    clientB.join(clientA.network?.Host);
    await wait();

    assert.strictEqual(clientA.UserInfo.id, '0');
    assert.strictEqual(clientB.network?.Host, clientA.UserInfo.id);
    assert.strictEqual(clientA.network?.size, 2);
    assert.strictEqual(clientB.network?.size, 2);
  });
});