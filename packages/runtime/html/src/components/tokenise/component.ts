import { State, Token } from "./types";

export function Tokenise(text: string): Token[] {
  let state = State.Data;

  let currentTagName = "";
  let currentAttrName = "";
  let currentAttrValue = "";
  let attributes: Record<string, string | true> = {};
  let selfClosing = false;
  let buffer = "";

  const tokens: Token[] = [];

  const emitText = () => {
    if (buffer) {
      tokens.push({ type: "text", value: buffer });
      buffer = "";
    }
  };

  const emitStartTag = () => {
    tokens.push({
      type: "startTag",
      name: currentTagName,
      attributes,
      selfClosing,
    });

    currentTagName = "";
    currentAttrName = "";
    currentAttrValue = "";
    attributes = {};
    selfClosing = false;
  };

  const emitCommentTag = () => {
    tokens.push({ type: "comment", value: currentTagName.replace(/^\<?!?-?-?/, '').replace(/-?-?\>?$/, '').trim() });
    currentTagName = "";
  }

  const emitDoctype = () => {
    tokens.push({ type: "doctype", value: currentTagName.replace(/doctype\s?/i, '').trim() });
    currentTagName = "";
  }

  const emitEndTag = () => {
    tokens.push({ type: "endTag", name: currentTagName });
    currentTagName = "";
  };

  const commitAttribute = () => {
    attributes[currentAttrName] =
      currentAttrValue === "" ? true : currentAttrValue;
    currentAttrName = "";
    currentAttrValue = "";
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    switch (state) {
      case State.Data:
        if (char === "<") {
          emitText();
          state = State.TagOpen;
        } else {
          buffer += char;
        }
        break;

      case State.TagOpen:
        if (char === "/") {
          state = State.EndTagOpen;
        } 
        else if (char === "!") {
          state = State.CommentStart;
        }
        else {
          currentTagName = char;
          state = State.TagName;
        }
        break;

      case State.EndTagOpen:
        if (isWhitespace(char)) break;
        currentTagName = char;
        state = State.EndTagName;
        break;

      case State.EndTagName:
        if (isWhitespace(char)) break;
        if (char === ">") {
          emitEndTag();
          state = State.Data;
        } else {
          currentTagName += char;
        }
        break;
      
      case State.CommentStart:
        if (char === "-")
          state = State.Comment;
        else 
        {
          currentTagName += char;
          if ("doctype".startsWith(currentTagName.toLowerCase()))
          {
            state = State.Doctype;
          }
          else 
          {
            state = State.Comment;
          }
        }
        break;

      case State.Doctype:
        if (char === ">") {
          emitDoctype();
          state = State.Data;
        } else {
          currentTagName += char;
          if (!"doctype".startsWith(currentTagName.toLowerCase()))
          {
            if (!/^doctype(\s+)?(\w?)+/i.test(currentTagName))
            {
              state = State.Comment;
            }
          }
        }
        break;

      case State.Comment:
        if (char === ">") {
          emitCommentTag();
          state = State.Data;
        } else {
          currentTagName += char;
        }
        break;

      case State.TagName:
        if (isWhitespace(char)) {
          state = State.BeforeAttributeName;
        } else if (char === "/") {
          selfClosing = true;
          state = State.SelfClosingStartTag;
        } else if (char === ">") {
          emitStartTag();
          state = State.Data;
        } else {
          currentTagName += char;
        }
        break;

      case State.BeforeAttributeName:
        if (isWhitespace(char)) break;
        if (char === "/") {
          selfClosing = true;
          state = State.SelfClosingStartTag;
        } else if (char === ">") {
          emitStartTag();
          state = State.Data;
        } else {
          currentAttrName = char;
          state = State.AttributeName;
        }
        break;

      case State.AttributeName:
        if (isWhitespace(char)) {
          commitAttribute();
          state = State.BeforeAttributeName;
        } else if (char === "=") {
          state = State.BeforeAttributeValue;
        } else if (char === ">") {
          commitAttribute();
          emitStartTag();
          state = State.Data;
        } else {
          currentAttrName += char;
        }
        break;

      case State.BeforeAttributeValue:
        if (isWhitespace(char)) break;
        if (char === `"`) state = State.AttributeValueDouble;
        else if (char === `'`) state = State.AttributeValueSingle;
        else {
          currentAttrValue = char;
          state = State.AttributeValueUnquoted;
        }
        break;

      case State.AttributeValueDouble:
        if (char === `"`) {
          commitAttribute();
          state = State.BeforeAttributeName;
        } else {
          currentAttrValue += char;
        }
        break;

      case State.AttributeValueSingle:
        if (char === `'`) {
          commitAttribute();
          state = State.BeforeAttributeName;
        } else {
          currentAttrValue += char;
        }
        break;

      case State.AttributeValueUnquoted:
        if (isWhitespace(char)) {
          commitAttribute();
          state = State.BeforeAttributeName;
        } else if (char === ">") {
          commitAttribute();
          emitStartTag();
          state = State.Data;
        } else {
          currentAttrValue += char;
        }
        break;

      case State.SelfClosingStartTag:
        if (char === ">") {
          emitStartTag();
          state = State.Data;
        }
        break;
    }
  }

  emitText();
  return tokens;
}

function isWhitespace(value: string) {
  return value === " " || value === "\n" || value === "\t" || value === "\r";
}
