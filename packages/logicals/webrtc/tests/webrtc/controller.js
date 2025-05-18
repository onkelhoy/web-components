export { }
// import {describe, it as test, afterEach} from 'node:test';
// import assert from 'node:assert';

// import {Controller, wait} from '@papit/webrtc';

// import * as mockserver from './mockserver';

// const nopeersconfig = {
//   socket: {
//     url: "ws://localhost:8000"
//   },
//   testing: {
//     peers: false
//   }
// }

// //#region ############ SETUP #####################

// beforeAll(() => {
//   mockserver.setup(8000);
// });

// afterAll(() => {
//   mockserver.teardown();
// });

describe("core controller functionalities", () => {
  // let clientA;
  // beforeAll(() => {
  //   clientA = new Controller(nopeersconfig);
  // });

  // it("should create a network", async () => {
  //   clientA.register({name: 'bananas'});
  //   await wait();
  //   expect(clientA.UserInfo.id).toBe('0');
  //   expect(clientA.network?.Info).toHaveProperty("name", "bananas");
  //   expect(clientA.network?.Host).toHaveProperty(clientA.UserInfo.id);
  // });
  // it("another client should connect to this network", async () => {
  //   const clientB = new Controller(nopeersconfig);
  //   await wait();
  //   clientB.join(clientA.network?.Host);
  //   await wait();

  //   expect(clientA.UserInfo.id).toBe('0');
  //   expect(clientB.network?.Host).toBe(clientA.UserInfo.id);
  //   expect(clientA.network?.size).toBe(2);
  //   expect(clientB.network?.size).toBe(2);
  // });
});