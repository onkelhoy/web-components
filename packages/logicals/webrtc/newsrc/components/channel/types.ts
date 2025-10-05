export type ChannelPayload = string | Blob | ArrayBuffer | ArrayBufferView<ArrayBufferLike>;

export type Kind = "user" | "system";
export type ChannelMessage = {
  kind: Kind;
  payload: ChannelPayload;
}
// export type ChannelMessageEvent = {
//   message: Object | MessageType;
//   event: MessageEvent<MessageType>;
// }

// export type SystemEvent =
//   | SystemOpenEvent
//   | SystemErrorEvent
//   | SystemCloseEvent
//   | SystemMessageEvent;

// export type SystemOpenEvent = {
//   type: "open";
//   event: Event;
// }
// export type SystemErrorEvent = {
//   type: "error";
//   event: Event;
// }
// export type SystemCloseEvent = {
//   type: "close";
//   event: Event;
// }
// export type SystemMessageEvent = {
//   type: "message";
//   event: MessageEvent<MessageType>;
//   message: SystemMessage;
// }

// type SystemMessage = {}