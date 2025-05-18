export { }
// import {describe, it as test, before, after, beforeEach, afterEach} from 'node:test';
// import assert from 'node:assert';

// import {
//   Socket,
//   wait,
//   Reactor,
// } from '@papit/webrtc';

// import * as mockserver from './mockserver';

// const reactor = new Reactor();
// const URL = 'ws://localhost:8000';
// let socket;

// const messages = {
//   [IncomingMessageType.Error]: [],
//   [IncomingMessageType.RegisterACK]: [],
//   [IncomingMessageType.UpdateACK]: [],
//   [IncomingMessageType.ConnectionACK]: [],
//   [MessageType.Target]: []
// };

// //#region ############ SETUP #####################

// before(() => {
//   mockserver.setup(8000);

//   const onmessage = (message) => {
//     messages[message.type].push(message);
//   };

//   reactor.on(IncomingMessageType.Error, onmessage);
//   reactor.on(IncomingMessageType.RegisterACK, onmessage);
//   reactor.on(IncomingMessageType.UpdateACK, onmessage);
//   reactor.on(IncomingMessageType.ConnectionACK, onmessage);
//   reactor.on(MessageType.Target, onmessage);
// });

// after(() => {
//   mockserver.teardown();
// });

// beforeEach(() => {
//   socket = new Socket(URL);
// });

// afterEach(() => {
//   socket.close();
//   for (const key in messages) {
//     messages[key] = [];
//   }
// });

// //#endregion ########### TESTS ######################

// describe('Socket Connection', () => {
//   test('Should connect successfully', async () => {
//     await wait();
//     await wait();

//     assert.strictEqual(socket.status, WebSocket.OPEN);
//     assert.strictEqual(messages[IncomingMessageType.ConnectionACK].length, 1);
//     assert.ok(messages[IncomingMessageType.ConnectionACK][0].id);
//   });

//   test('Should reconnect on failure', async () => {
//     socket.terminate(true);
//     assert.ok(
//       [WebSocket.CLOSED, WebSocket.CLOSING].includes(socket.status)
//     );

//     await wait(2000);

//     assert.ok(
//       [WebSocket.OPEN, WebSocket.CONNECTING].includes(socket.status)
//     );
//   });

//   test('Should disconnect successfully', () => {
//     socket.close();
//     assert.ok(
//       [WebSocket.CLOSED, WebSocket.CLOSING].includes(socket.status)
//     );
//   });

//   test('Should handle connection loss', async () => {
//     mockserver.teardown();
//     await wait();

//     assert.ok(
//       [WebSocket.CLOSED, WebSocket.CLOSING].includes(socket.status)
//     );

//     mockserver.setup(8000);
//     await wait(1000);

//     assert.ok(
//       [WebSocket.OPEN, WebSocket.CONNECTING].includes(socket.status)
//     );
//   });
// });

// describe('Socket Send', () => {
//   test('should register network', async () => {
//     socket.send({
//       type: OutgoingMessageType.Register,
//       network: {name: 'test'}
//     });

//     await wait();

//     assert.strictEqual(messages[IncomingMessageType.RegisterACK].length, 1);
//   });

//   test('should register network & update', async () => {
//     socket.send({
//       type: OutgoingMessageType.Register,
//       network: {name: 'test'}
//     });

//     await wait();

//     socket.send({
//       type: OutgoingMessageType.Update,
//       network: {name: 'test-bla'}
//     });

//     await wait();
//     await wait();

//     assert.strictEqual(messages[IncomingMessageType.UpdateACK].length, 1);
//   });

//   test('Should store message on offline', () => {
//     socket.terminate();
//     const now = socket.offlineCount;

//     socket.send({type: 'test'});
//     socket.send({type: 'test'});
//     socket.send({type: 'test'});

//     assert.strictEqual(socket.offlineCount - now, 3);
//   });

//   test('Should send all offline messages on reconnect', async () => {
//     socket.terminate();
//     assert.strictEqual(socket.offlineCount, 0);

//     socket.send({type: 'test'});
//     socket.send({type: 'test'});
//     socket.send({type: 'test'});

//     assert.strictEqual(socket.offlineCount, 3);

//     socket.reconnect();
//     await wait(3000);

//     assert.ok(socket.offlineCount < 3);
//   });
// });
