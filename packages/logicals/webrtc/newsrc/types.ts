export type MessageType = "error";
export type Message<T extends string, D = any> = {
  type: MessageType | T;
  payload: D;
}
