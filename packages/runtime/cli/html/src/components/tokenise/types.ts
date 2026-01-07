export enum State {
  Data,
  TagOpen,
  TagName,
  EndTagOpen,
  EndTagName,
  CommentStart,
  Comment,
  Doctype,
  BeforeAttributeName,
  AttributeName,
  BeforeAttributeValue,
  AttributeValueDouble,
  AttributeValueSingle,
  AttributeValueUnquoted,
  SelfClosingStartTag,
}

export type Token =
  | { type: "text"; value: string }
  | { type: "doctype"; value: string }
  | { type: "comment"; value: string }
  | { type: "startTag"; name: string; attributes: Record<string, string | true>; selfClosing: boolean }
  | { type: "endTag"; name: string };