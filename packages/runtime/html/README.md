# @papit/html

A minimal HTML parser for Node.js that exposes a **core subset of the browser’s DOM API**, designed to be small, fast, and fully under your control.

---

![Type](https://img.shields.io/badge/Type-runtime-orange)
[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/html.svg?logo=npm)](https://www.npmjs.com/package/@papit/html)

---

## Features

- Minimal, zero-dependency HTML parser.
- Browser-like `Document`, `Element`, and `TextNode` classes.
- Supports:

  - `innerHTML` / `outerHTML`
  - `querySelector` / `querySelectorAll`
  - `closest()`
  - `className` and `classList`
  - Attributes on elements

- Fully extendable — add more DOM-like features as needed.

> ⚠️ Not a full browser DOM yet — optional tags, events, and advanced HTML quirks are intentionally omitted for minimal footprint.

---

## Installation

```bash
npm install @papit/html
```

---

## Usage

```ts
import { Document } from "@papit/html";

const dom = new Document();
dom.innerHTML = `
  <div class="container">
    <h1>Hello World</h1>
    <p class="intro">Welcome to @papit/html!</p>
  </div>
`;

const header = dom.querySelector("h1");
console.log(header?.textContent); // "Hello World"

const paragraphs = dom.querySelectorAll("p.intro");
console.log(paragraphs.length); // 1

console.log(dom.outerHTML);
/*
  <#document>
    <div class="container">
      <h1>Hello World</h1>
      <p class="intro">Welcome to @papit/html!</p>
    </div>
  </#document>
*/
```

---

## Quick Reference

`@papit/html` exposes a minimal set of DOM-like APIs for working with HTML programmatically:

### Document

- `new Document()` – create a new document node.
- `createElement(tagName: string, options?: ElementOption)` – create an element with optional class, attributes, children, and text.
- `createTextNode(text: string)` – create a text node.
- `innerHTML` / `outerHTML` – get or set HTML content of the document.

### Element

- `appendChild(element: Element)` – add a child element or text node.
- `removeChild(index: number)` – remove a child element by index.
- `querySelector(selector: string | QueryPart[])` – find the first matching element.
- `querySelectorAll(selector: string | QueryPart[])` – find all matching elements.
- `closest(selector: string)` – find the nearest ancestor matching the selector.
- `className` / `classList` – read or modify classes.
- `attributes` – read or modify element attributes.
- `innerHTML` / `outerHTML` – get or set HTML content of an element.

### TextNode

- `textContent` – the textual content of the node.

---

## Contributing

Contributions are welcome! Please follow the development guidelines above and ensure all tests pass before submitting a pull request.

---

## License

Licensed under the @Papit License 1.0 – Copyright (c) 2024 Henry Pap (@onkelhoy)

**Key points:**

- ✅ Free to use in commercial projects
- ✅ Free to modify and distribute
- ✅ Attribution required
- ❌ Cannot resell the component itself as a standalone product

See the [LICENSE](https://github.com/onkelhoy/web-components/blob/main/LICENSE) file for full details.

---

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/onkelhoy/web-components).
