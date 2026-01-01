export enum State {
  Data,
  TagOpen,
  TagName,
  EndTagOpen,
  EndTagName,          // 👈 ADD THIS
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
  | { type: "startTag"; name: string; attributes: Record<string, string | true>; selfClosing: boolean }
  | { type: "endTag"; name: string };