export { }
// import http from 'http';
// import ws from 'ws';
// import {IncomingMessageType, MessageType, OutgoingMessageType} from '@papit/webrtc';

// let server;
// let wss;
// let id = 0;
// const hosts = new Map();
// const sockets = new Map();

// export function setup(port) {
//   server = http.createServer();
//   wss = new ws.WebSocketServer({server});

//   wss.on('connection', connected)

//   server.listen(port);
// }

// export function teardown() {
//   id = 0;
//   wss.close();
//   server.close();
//   hosts.clear();
//   sockets.clear();
// }

// function connected(socket) {
//   socket.id = id.toString();
//   id++;

//   sockets.set(socket.id, socket);

//   send(socket, {
//     type: IncomingMessageType.ConnectionACK,
//     id: socket.id,
//   });

//   socket.onmessage = function (strmessage) {
//     const message = JSON.parse(strmessage.data);
//     switch (message.type) {
//       case MessageType.Target: {
//         const {target} = message;
//         const tsocket = sockets.get(target);
//         if (tsocket) {
//           send(tsocket, message);
//         }
//         else {
//           send(socket, {
//             type: IncomingMessageType.Error,
//             error: 'Target not found',
//           });
//         }
//         break;
//       }
//       case OutgoingMessageType.Update:
//       case OutgoingMessageType.Register: {
//         const network = {...(message).network, id: socket.id};
//         hosts.set(socket.id, network);

//         send(socket, {
//           type: message.type === OutgoingMessageType.Register ? IncomingMessageType.RegisterACK : IncomingMessageType.UpdateACK,
//           network: hosts.get(socket.id),
//         });
//         break;
//       }
//     }
//   }
// }

// function send(socket, message) {
//   const strmessage = JSON.stringify(message);

//   socket.send(strmessage);
// }