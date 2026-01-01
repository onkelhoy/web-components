import { describe, it } from "node:test";
import assert from "node:assert";
import { Tokenise } from "@papit/html";

describe("Tokenise", () => {

  it("should tokenize plain text", () => {
    const html = "hello world";
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [{ type: "text", value: "hello world" }]);
  });

  it("should tokenize a simple tag", () => {
    const html = "<div>";
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      { type: "startTag", name: "div", attributes: {}, selfClosing: false }
    ]);
  });

  it("should tokenize a tag with attributes", () => {
    const html = `<div id="foo" hidden class='bar'>`;
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      { 
        type: "startTag", 
        name: "div", 
        attributes: { id: "foo", hidden: true, class: "bar" }, 
        selfClosing: false 
      }
    ]);
  });

  it("should tokenize self-closing tags", () => {
    const html = `<img src="pic.jpg" />`;
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      { type: "startTag", name: "img", attributes: { src: "pic.jpg" }, selfClosing: true }
    ]);
  });

  it("should tokenize end tags", () => {
    const html = "</div>";
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      { type: "endTag", name: "div" }
    ]);
  });

  it("should tokenize mixed content", () => {
    const html = `<div>Hello <span>World</span>!</div>`;
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      { type: "startTag", name: "div", attributes: {}, selfClosing: false },
      { type: "text", value: "Hello " },
      { type: "startTag", name: "span", attributes: {}, selfClosing: false },
      { type: "text", value: "World" },
      { type: "endTag", name: "span" },
      { type: "text", value: "!" },
      { type: "endTag", name: "div" }
    ]);
  });

  it("should handle unquoted attribute values", () => {
    const html = `<input type=text disabled>`;
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      { type: "startTag", name: "input", attributes: { type: "text", disabled: true }, selfClosing: false }
    ]);
  });

});
