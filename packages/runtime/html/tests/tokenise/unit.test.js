import { describe, it } from "node:test";
import assert from "node:assert";
import { Tokenise } from "@papit/html";

describe("Tokenise", () => {

  describe("comment", () => {
    it("should tokenize a simple comment", () => {
      const html = "<!comment>";
      const tokens = Tokenise(html);

      assert.deepStrictEqual(tokens, [
        { type: "comment", value: "comment" }
      ]);
    });

    it("should tokenize a comment with spaces", () => {
      const html = "<!this is a comment>";
      const tokens = Tokenise(html);

      assert.deepStrictEqual(tokens, [
        { type: "comment", value: "this is a comment" }
      ]);
    });

    it("should tokenize comments inside elements", () => {
      const html = "<div>Hi<!note>There</div>";
      const tokens = Tokenise(html);

      assert.deepStrictEqual(tokens, [
        { type: "startTag", name: "div", attributes: {}, selfClosing: false },
        { type: "text", value: "Hi" },
        { type: "comment", value: "note" },
        { type: "text", value: "There" },
        { type: "endTag", name: "div" }
      ]);
    });

    it("should tokenize multiple comments", () => {
      const html = "<!a><!b><!c>";
      const tokens = Tokenise(html);

      assert.deepStrictEqual(tokens, [
        { type: "comment", value: "a" },
        { type: "comment", value: "b" },
        { type: "comment", value: "c" }
      ]);
    });

    it("should allow symbols inside comments", () => {
      const html = "<!@#$%^&*()>";
      const tokens = Tokenise(html);

      assert.deepStrictEqual(tokens, [
        { type: "comment", value: "@#$%^&*()" }
      ]);
    });

    it("should not fall through from Comment into TagName", () => {
      const html = "<!test>";
      const tokens = Tokenise(html);

      assert.strictEqual(tokens.length, 1);
      assert.strictEqual(tokens[0].type, "comment");
    });

    it("supports HTML <!-- --> comments", () => {
      const html = "<!-- hello -->";
      const tokens = Tokenise(html);

      // current tokenizer behavior
      assert.deepStrictEqual(tokens, [
        { type: "comment", value: "hello" }
      ]);
    });
  });

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

  it("should tokenize a tag with attribute that has spaces", () => {
    const html = `<div id="foo" hidden class='foo bar'>`;
    const tokens = Tokenise(html);
    assert.deepStrictEqual(tokens, [
      {
        type: "startTag",
        name: "div",
        attributes: { id: "foo", hidden: true, class: "foo bar" },
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
