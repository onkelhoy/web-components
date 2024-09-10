import http from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { Duplex } from "node:stream";

const connectedClients = new Map<string, Duplex>();

export function upgrade(this: http.Server, req: http.IncomingMessage, socket: Duplex, head: Buffer) {
  // handshake
  const acceptKey = req.headers['sec-websocket-key'];
  const hash = createHash('sha1')
    .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${hash}`
  ];
  socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

  // keeping track
  const socketid = randomUUID();
  connectedClients.set(socketid, socket);

  if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[31m", 'client connected', "\x1b[0m");

  // events 
  socket.on('error', handleError.bind(socket, socketid));
  socket.on('data', handleData.bind(socket, socketid));
  socket.on('end', handleEnd.bind(socket, socketid));
}

// event handlers 
function handleError(this: Duplex, socketid: string, error: any) {
  if ('code' in error && error.code === 'ECONNRESET') {
    if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[31m", 'client disconnected', "\x1b[0m");
    connectedClients.delete(socketid);
  }
  else if (process.env.LOGLEVEL !== "none") {
    console.log('socket-error', socketid, error);
  }
}
function handleData(this: Duplex, socketid: string, buffer: Buffer) {
  const message = buffer.toString();
  if (["debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[34m", 'Received: ', message, "\x1b[0m");

  // Echoing back the received message (simplified, not handling actual WebSocket frames)
  this.write(frameWebSocketMessage(message));
}
function handleEnd(this: Duplex, socketid: string) {
  if (["verbose", "debug"].includes(process.env.LOGLEVEL || "")) console.log("\x1b[31m", 'client disconnected', "\x1b[0m");

  // TODO: have to find the client-id to be removed so we can remove it from the connectedClients list 
  connectedClients.delete(socketid);
}

// exposed functions 
export function update(filename: string, content: string) {
  // notify all clients 
  if (connectedClients.size === 0) {
    if (["debug"].includes(process.env.LOGLEVEL || "")) console.log('No clients connected to send update!');
    return
  }

  const message = frameWebSocketMessage({ action: 'update', filename, content });
  connectedClients.forEach((client) => {
    if (!client) {
      if (["debug"].includes(process.env.LOGLEVEL || "")) console.log('socket-error: [update] could not find client');
    } else {
      client.write(message);
    }
  });
}
export function error(filename: string, errors: any[]) {
  // notify all clients 
  if (connectedClients.size === 0) {
    if (["debug"].includes(process.env.LOGLEVEL || "")) console.log('No clients connected to send error!');
  }

  // connectedClients.forEach(client => {
  //   if (!client) client.write(JSON.stringify({ action: 'error', filename, error: errors }));
  //   else console.log('errorina?')
  // });

  const message = frameWebSocketMessage({ action: 'error', filename, error: errors });
  connectedClients.forEach((client) => {
    if (!client) {
      if (["debug"].includes(process.env.LOGLEVEL || "")) console.log('socket-error: [error] could not find client');
    } else {
      client.write(message);
    }
  });
}

// helper functions
function frameWebSocketMessage(jsondata: any): Buffer {
  const json = JSON.stringify(jsondata);
  const jsonByteLength = Buffer.byteLength(json);
  const lengthByteCount = jsonByteLength < 126 ? 0 : 2;
  const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126;
  const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength);

  // Set the first byte to indicate a text frame
  buffer[0] = 0b10000001;

  // Set the payload length
  buffer[1] = payloadLength;
  if (lengthByteCount > 0) {
    buffer.writeUInt16BE(jsonByteLength, 2);
  }

  // Write the JSON data to the buffer
  buffer.write(json, 2 + lengthByteCount);

  return buffer;
}