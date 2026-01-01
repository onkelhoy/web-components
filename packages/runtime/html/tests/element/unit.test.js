import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { CSS, Query, Element, Document, TextNode, Node } from "@papit/html";


describe("Node / Element", () => {

  describe("Node", () => {
    it("should have default properties", () => {
      const node = new (class extends Node { })();
      assert.strictEqual(node.parent, null);
      assert.strictEqual(node.textContent, null);
      assert.strictEqual(node.nodeType, undefined);
    });
  });

  describe("TextNode", () => {
    it("should store text content", () => {
      const text = new TextNode("hello");
      assert.strictEqual(text.textContent, "hello");
      assert.strictEqual(text.nodeType, Node.TEXT_NODE);
    });
  });

  describe("Element", () => {
    let doc, el;

    beforeEach(() => {
      doc = new Document();
      el = doc.createElement("div", { attributes: { id: "main" }, className: "foo bar" });
    });

    it("should store tagName, attributes, and className", () => {
      assert.strictEqual(el.tagName, "div");
      assert.deepStrictEqual(el.attributes, { id: "main" });
      assert.strictEqual(el.className, "foo bar");
      assert.ok(el.classList.contains("foo"));
      assert.ok(el.classList.contains("bar"));
    });

    it("should append and remove children", () => {
      const child = doc.createElement("span", { attributes: {} });
      el.appendChild(child);
      assert.strictEqual(el.children.length, 1);
      assert.strictEqual(el.children[0], child);

      el.removeChild(0);
      assert.strictEqual(el.children.length, 0);
    });

    it("should compute innerHTML and outerHTML", () => {
      const child = doc.createElement("span", { attributes: { title: "hi" } });
      const text = new TextNode("Hello");
      child.appendChild(text);
      el.appendChild(child);

      const expectedInner = '<span title="hi">Hello</span>';
      const expectedOuter = '<div class="foo bar" id="main">' + expectedInner + '</div>';

      assert.strictEqual(el.innerHTML, expectedInner);
      assert.strictEqual(el.outerHTML, expectedOuter);
    });

    it("should update innerHTML and rebuild children", () => {
      el.innerHTML = '<span>Test</span>';
      assert.strictEqual(el.children.length, 1);
      assert.strictEqual((el.children[0]).tagName, "span");
      assert.strictEqual((el.children[0].children[0]).textContent, "Test");
    });

    it("should querySelector and querySelectorAll", () => {
      const child1 = doc.createElement("span", { attributes: { id: "a" }, className: "foo" });
      const child2 = doc.createElement("span", { attributes: { id: "b" }, className: "bar" });
      el.appendChild(child1);
      el.appendChild(child2);

      const found = el.querySelector("#a");
      assert.strictEqual(found, child1);

      const allSpans = el.querySelectorAll("span");
      assert.strictEqual(allSpans.length, 2);
    });

    it("should find closest matching ancestor", () => {
      const parent = doc.createElement("div", { attributes: { id: "parent" } });
      const child = doc.createElement("span", { attributes: {} });
      const grandChild = doc.createElement("em", {});

      parent.appendChild(child);
      child.appendChild(grandChild);

      assert.strictEqual(grandChild.closest("#parent"), parent);
    });
  });

  describe("Document", () => {
    let doc;

    beforeEach(() => {
      doc = new Document();
    });

    it("should create text nodes and elements", () => {
      const text = doc.createTextNode("hello");
      assert.strictEqual(text.textContent, "hello");

      const el = doc.createElement("div", { attributes: {} });
      assert.strictEqual(el.tagName, "div");
      assert.strictEqual(el.ownerDocument, doc);
    });

    it("should build tree from innerHTML", () => {
      doc.innerHTML = "<div><span>Hi</span></div>";
      const div = doc.children[0];
      const span = div.children[0];
      const text = span.children[0];

      assert.strictEqual(div.tagName, "div");
      assert.strictEqual(span.tagName, "span");
      assert.strictEqual(text.textContent, "Hi");
    });
  });

});

describe("Query", () => {
  it("should parse simple tag selectors", () => {
    const result = Query("div");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].tag, "div");
    assert.strictEqual(result[0].class, undefined);
    assert.strictEqual(result[0].attribute, undefined);
    assert.strictEqual(result[0].text, undefined);
  });

  it("should parse class selectors", () => {
    const result = Query(".foo");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].tag, undefined);
    assert.strictEqual(result[0].class, ".foo");
  });

  it("should parse tag with class", () => {
    const result = Query("div.bar");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].tag, "div");
    assert.strictEqual(result[0].class, ".bar");
  });

  it("should parse attributes", () => {
    const result = Query("[id=main]");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].attribute?.name, "[id");
    assert.strictEqual(result[0].attribute?.value, "main]");
  });

  it("should parse text selectors", () => {
    const result = Query("{Hello}");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, "{Hello}");
  });

  it("should handle combined selectors", () => {
    const result = Query("div.bar[baz=qux]{Hello}");
    const part = result[0];
    assert.strictEqual(part.tag, "div");
    assert.strictEqual(part.class, ".bar");
    assert.strictEqual(part.attribute?.name, "[baz");
    assert.strictEqual(part.attribute?.value, "qux]");
    assert.strictEqual(part.text, "{Hello}");
  });

  it("should split multiple selectors separated by space, >, or +", () => {
    const result = Query("div > span + .foo");
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].tag, "div");
    assert.strictEqual(result[1].tag, "span");
    assert.strictEqual(result[2].class, ".foo");
  });

  it("should ignore empty parts", () => {
    const result = Query("   div   ");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].tag, "div");
  });
});


describe("CSS", () => {
  let cls;

  beforeEach(() => {
    cls = new CSS("foo bar");
  });

  it("should initialize className correctly", () => {
    assert.strictEqual(cls.className, "foo bar");
  });

  it("should expose classList as a proxy", () => {
    const list = cls.classList;
    assert(list instanceof Set);
    assert(list.contains("foo"));
    assert(list.contains("bar"));
    assert(!list.contains("baz"));
  });

  it("should add classes via classList.add", () => {
    cls.classList.add("baz", "qux");
    assert(cls.classList.contains("baz"));
    assert(cls.classList.contains("qux"));
    assert.strictEqual(cls.className, "foo bar baz qux");
  });

  it("should remove classes via classList.remove", () => {
    cls.classList.remove("foo");
    assert(!cls.classList.contains("foo"));
    assert.strictEqual(cls.className, "bar");
  });

  it("should toggle classes via classList.toggle", () => {
    const added = cls.classList.toggle("foo"); // already exists, should remove
    assert.strictEqual(added, false);
    assert(!cls.classList.contains("foo"));

    const toggled = cls.classList.toggle("baz"); // doesn't exist, should add
    assert.strictEqual(toggled, true);
    assert(cls.classList.contains("baz"));
  });

  it("should support force toggle", () => {
    cls.classList.toggle("baz", true); // force add
    assert(cls.classList.contains("baz"));
    cls.classList.toggle("baz", false); // force remove
    assert(!cls.classList.contains("baz"));
  });

  it("should reflect changes in className when classList is modified", () => {
    cls.classList.add("new");
    cls.classList.remove("foo");
    cls.classList.toggle("bar");
    assert.strictEqual(cls.className, "new");
  });

  it("should return correct value via classList.value", () => {
    assert.strictEqual(cls.classList.value, cls.className);
  });
});