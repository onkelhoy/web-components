import { ChannelPayload, Kind, ChannelMessage } from "./types";

export class Channel extends EventTarget {
  constructor(
    public readonly channel: RTCDataChannel,
    public readonly kind: Kind = "user"
  ) {
    super();

    this.channel.addEventListener("message", (event: MessageEvent<ChannelPayload>) => {
      const message = Channel.parse(event);
    });

    ["open", "close"].forEach((t) =>
      this.channel.addEventListener(t, (e: Event) =>
        this.dispatchEvent(new CustomEvent<Event>(t, { detail: e }))
      )
    );

    this.channel.addEventListener("error", (e: RTCErrorEvent) =>
      this.dispatchEvent(new CustomEvent<RTCErrorEvent>("error", { detail: e }))
    );
  }

  send(payload: ChannelPayload) {
    const message: ChannelMessage = {
      kind: this.kind,
      payload,
    }

    this.channel.send(JSON.stringify(message));
  }

  private static parse<T = Object>(event: MessageEvent): T {
    if (typeof event.data == "string" && /^[{\[]/.test(event.data))
    {
      return JSON.parse(event.data) as T;
    }

    return event.data;
  }
}