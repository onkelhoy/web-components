// types
import { EventError, EventErrorType, Events } from "types";
import { Message } from "types.message";

// utils
import { Reactor } from "utils/reactor";
import { GlobalInfo } from "utils/global";
import { Logger } from "utils/logger";

// locals
import { SocketErrorMessage, SocketIncomingMessageType, SocketOutgoingMessage } from "./types";

const MAX_ATTEMPTS = 10;
const RECONNECT_TIME_INTERVAL_STEP = 700; // with attempt=10 => 1400 (total time = 10850)
const reactor = new Reactor();

export class Socket {
  private ws!: WebSocket;
  private attempts: number;
  private offline: SocketOutgoingMessage[];
  private protocols?: string | string[];
  private url: string | URL;
  private printerror = Logger("socket", "error");
  private log = Logger("socket");

  constructor(url: string | URL, protocols?: string | string[]) {
    this.attempts = 0;
    this.offline = [];
    this.protocols = protocols;
    this.url = url;

    this.setup();
  }

  get offlineCount() { return this.offline.length; }
  get status() { return this.ws.readyState; }

  // private methods
  private setup() {
    this.close(); // logs out socket if exists

    this.ws = new window.WebSocket(this.url, this.protocols);
    this.ws.onmessage = this.message;
    this.ws.onerror = this.error;
    this.ws.onopen = this.open;
    this.ws.onclose = () => {
      if (["info", "debug"].includes(GlobalInfo.logger)) this.log('connection', 'closed');
    }
  }

  private message = (msg: MessageEvent) => {
    if (typeof msg.data === "string")
    {
      const message: Message = JSON.parse(msg.data);

      switch (message.type)
      {
        default: {
          // target, update-ack, register-ack, connection-ack
          reactor.dispatch(message.type, message);
          break;
        }
        case SocketIncomingMessageType.RegisterACK:
        // reactor.dispatch()
        case SocketIncomingMessageType.UpdateACK: {
          reactor.dispatch(Events.NetworkUpdate, message.network);
          break;
        }
        case SocketIncomingMessageType.ConnectionACK: {
          const { id } = message;
          GlobalInfo.user = { ...GlobalInfo.user, id };
          if (["info", "debug"].includes(GlobalInfo.logger)) this.log('welcome-id', id);
          break;
        }
        case SocketIncomingMessageType.Error: {
          const reason = (message as SocketErrorMessage).error;
          if (["error", "warning", "info", "debug"].includes(GlobalInfo.logger)) this.printerror("message", reason);
          reactor.dispatch(Events.Error, { type: EventErrorType.Socket, reason: "unknown" } as EventError);
          break;
        }
      }

    }
  }

  private error = (event: Event) => {
    if (([WebSocket.OPEN, WebSocket.CONNECTING] as number[]).includes(this.ws.readyState))
    {
      reactor.dispatch(Events.Error, { type: EventErrorType.Socket, reason: "unknown" } as EventError);
      if (["error", "warning", "debug"].includes(GlobalInfo.logger)) this.printerror("connection", event);
      return;
    }

    if (this.attempts < MAX_ATTEMPTS)
    {
      this.attempts++;
      setTimeout(() => {
        this.setup();
      }, (Math.sign(this.attempts) + (this.attempts / MAX_ATTEMPTS)) * RECONNECT_TIME_INTERVAL_STEP)
    }
    else 
    {
      reactor.dispatch(Events.Error, { type: EventErrorType.Socket, reason: "attempts maxed out" } as EventError);
      if (["fatal", "error", "warning", "debug"].includes(GlobalInfo.logger)) this.printerror("connection", "attempts maxed out", this.attempts);
    }
  }

  private open = () => {
    if (["info", "debug"].includes(GlobalInfo.logger)) this.log('connection', 'established');
    this.attempts = 0;
    while (this.offline.length > 0)
    {
      const message = this.offline.pop();
      if (message)
      {
        this.send(message); // will send the rest
        return;
      }
    }

    reactor.dispatch(Events.SocketOpen);
  }

  // public methods
  public reconnect() {
    this.attempts = 0;
    this.setup();
  }

  public send(message: SocketOutgoingMessage) {
    const msg = JSON.stringify(message);
    if (this.ws.readyState === WebSocket.OPEN)
    {
      this.ws.send(msg);
      while (this.offline.length > 0)
      {
        const message = this.offline.pop();
        if (message) this.send(message);
      }
      return true;
    }

    this.offline.push(message);
    return false;
  }

  public close() {
    if (!this.ws) return;

    // remove events
    this.ws.onerror = null;
    this.ws.onmessage = null;
    this.ws.onopen = null;

    this.terminate();
  }

  public terminate(test?: boolean) {
    if (!this.ws) return;
    if (!test) this.attempts = MAX_ATTEMPTS;
    this.ws.close();
  }
}