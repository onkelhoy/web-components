import { IncommingSocketMessage, MAX_ATTEMPTS, MESSAGE_TYPE_MAP, OutgoingSocketMessage, RECONNECT_TIME_INTERVAL_STEP } from "./types";

export class Socket extends EventTarget {
  private ws!: WebSocket;
  private attempts = 0;
  private offline: OutgoingSocketMessage[];

  constructor(
    private url: string | URL,
    private protocols?: string | string[] | undefined
  ) {
    super();
    this.reconnect();
  }

  // public functions 
  public close() {
    if (!this.ws) return;

    this.ws.removeEventListener("error", this.handleError);
    this.ws.removeEventListener("message", this.handleMessage);
    this.ws.removeEventListener("open", this.handleOpen);
    this.ws.close();
  }

  public send(message: OutgoingSocketMessage) {
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

  // event handlers 
  private handleMessage = (event: MessageEvent) => {
    if (typeof event.data != "string") return;

    const message = JSON.parse(event.data) as IncommingSocketMessage;

    switch (message.type)
    {
      case "network-register-ack":
      case "network-update-ack":
      case "socket-connection-ack":
      case "target": {
        const type = MESSAGE_TYPE_MAP[message.type];
        this.dispatchEvent(new CustomEvent(type, { detail: message[type] }));
        break;
      }
      case "error": {
        this.dispatchEvent(new CustomEvent("error", { detail: { type: "server", error: message.error } }));
        break;
      }
      default: {
        this.dispatchEvent(new CustomEvent("error", { detail: { type: "server", error: "unknown type received", payload: message } }));
      }
    }
  }
  private handleError = (event: Event) => {
    if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState as any))
    {
      this.dispatchEvent(new CustomEvent("error", { detail: { type: "event", error: event.type, event } }));
      return;
    }

    if (this.attempts > MAX_ATTEMPTS)
    {
      this.dispatchEvent(new CustomEvent("error", { detail: { type: "limit", error: "attempts maxed out", attempts: this.attempts } }))
      return;
    }
    this.attempts++;
    setTimeout(this.reconnect, (Math.sign(this.attempts) + (this.attempts / MAX_ATTEMPTS)) * RECONNECT_TIME_INTERVAL_STEP)
  }
  private handleOpen = () => {
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
  }
  private handleClose = (event?: CloseEvent) => {

  }

  // private functions 
  private reconnect = () => {
    this.close(); // logs out socket if exists

    this.ws = new window.WebSocket(this.url, this.protocols);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("error", this.handleError);
    this.ws.addEventListener("open", this.handleOpen);
    this.ws.addEventListener("close", this.handleClose);
  }
}