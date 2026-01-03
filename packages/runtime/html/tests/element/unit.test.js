import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { Query, Document, Node } from "@papit/html";

describe("Node / Element", () => {

  describe("Node", () => {
    it("should have default node relationships", () => {
      const doc = new Document();
      const node = doc.createElement("div");

      assert.strictEqual(node.parentNode, null);
      assert.strictEqual(node.parentElement, null);
      assert.strictEqual(node.childNodes.length, 0);
      assert.strictEqual(node.ownerDocument, doc);
    });
  });

  describe("Text", () => {
    it("should store text content", () => {
      const doc = new Document();
      const text = doc.createTextNode("hello");

      assert.strictEqual(text.textContent, "hello");
      assert.strictEqual(text.nodeType, Node.TEXT_NODE);
    });
  });

  describe("Comment", () => {
    it("should parse comment", () => {
      const doc = new Document();
      doc.innerHTML = `
        <!-- comment1 -->
        <!-- comment2 -->
        <div>Hello World</div>
      `;

      assert.strictEqual(doc.childNodes.length, 3);
      assert.strictEqual(doc.childNodes.item(0).nodeName, "COMMENT_NODE", "comment.nodeName != COMMENT_NODE");
      assert.strictEqual(doc.childNodes.item(0).textContent, "comment1", `"${doc.childNodes.item(0).textContent}" != "comment1"`);
      assert.strictEqual(doc.childNodes.item(1).textContent, "comment2");
      assert.strictEqual(doc.documentElement.tagName, "div");
    });

    it("should parse comment with doctype", () => {
      const doc = new Document();
      doc.innerHTML = `
        <!doctype html>
        <!-- comment1 -->
        <!-- comment2 -->
        <div>Hello World</div>
      `;

      console.log(doc.childNodes.item(0).nodeName);
      assert.strictEqual(doc.childNodes.length, 4);
      assert.strictEqual(doc.childNodes.item(0).nodeName, "DOCUMENT_TYPE_NODE", doc.childNodes.item(0).nodeName);
      assert.strictEqual(doc.childNodes.item(0).name, "html");
      assert.strictEqual(doc.childNodes.item(1).textContent, "comment1", `"${doc.childNodes.item(0).textContent}" != "comment1"`);
      assert.strictEqual(doc.childNodes.item(2).textContent, "comment2");
      assert.strictEqual(doc.documentElement.tagName, "div");
      assert.strictEqual(doc.outerHTML, "<!DOCTYPE html><!-- comment1 --><!-- comment2 --><div>Hello World</div>");

    });
  })

  describe("Element", () => {
    let doc;
    let el;

    beforeEach(() => {
      doc = new Document();
      el = doc.createElement("div");

      el.id = "main";
      el.classList.add("foo", "bar");
    });

    it("should store tagName, attributes, and className", () => {
      assert.strictEqual(el.tagName, "div");
      assert.strictEqual(el.getAttribute("id"), "main");
      assert.strictEqual(el.classList.length, 2);
      assert.strictEqual(el.className, "foo bar");

      assert(el.classList.contains("foo"));
      assert(el.classList.contains("bar"));
    });

    it("should append and remove children", () => {
      const child = doc.createElement("span");

      el.appendChild(child);
      assert.strictEqual(el.children.length, 1);
      assert.strictEqual(el.children[0], child);

      el.removeChild(child);
      assert.strictEqual(el.children.length, 0);
      assert.strictEqual(child.parentNode, null);
    });

    it("should compute innerHTML and outerHTML", () => {
      const span = doc.createElement("span");
      span.setAttribute("title", "hi");

      const text = doc.createTextNode("Hello");
      span.appendChild(text);
      el.appendChild(span);

      assert.strictEqual(span.getAttribute("title"), "hi", "span does not have title=hi");

      const expectedInner = '<span title="hi">Hello</span>';
      const expectedOuter =
        '<div class="foo bar" id="main">' + expectedInner + '</div>';

      assert.strictEqual(el.innerHTML, expectedInner, "expected inner failed");
      assert.strictEqual(el.outerHTML, expectedOuter, "expected outer failed");
    });

    it("should update innerHTML and rebuild children", () => {
      el.innerHTML = "<span>Test</span>";

      assert.strictEqual(el.children.length, 1);
      assert.strictEqual(el.children[0].tagName, "span");
      assert.strictEqual(
        el.children[0].childNodes.item(0).textContent,
        "Test"
      );
    });

    it("should querySelector and querySelectorAll", () => {
      const child1 = doc.createElement("span");
      child1.id = "a";
      child1.classList.add("foo");

      const child2 = doc.createElement("span");
      child2.id = "b";
      child2.classList.add("bar");

      el.appendChild(child1);
      el.appendChild(child2);

      const found = el.querySelector("#a");
      assert.strictEqual(found, child1);

      const allSpans = el.querySelectorAll("span");
      assert.strictEqual(allSpans.length, 2);
    });

    it("should find closest matching ancestor", () => {
      const parent = doc.createElement("div");
      parent.id = "parent";

      const child = doc.createElement("span");
      const grandChild = doc.createElement("em");

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
      assert.strictEqual(text.textContent, "hello", "text content is not hello");

      const el = doc.createElement("div");
      assert.strictEqual(el.tagName, "div", "tag name is not div");
      assert.strictEqual(el.ownerDocument, doc, "ownerDocument is not doc");
    });

    it("should build tree from innerHTML", () => {
      doc.innerHTML = "<div><span>Hi</span></div>";

      const div = doc.children[0];
      const span = div.children[0];
      const text = span.childNodes.item(0);

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
