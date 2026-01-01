# @papit/html

a minimal, zero-dependency HTML parser and DOM-like runtime for Node.js, exposing a deliberate subset of the browser DOM API.

The goal of `@papit/html` is **correct structure, traversal, and manipulation** of HTML documents — without rendering, layout, or browser-specific complexity.

---

![Type](https://img.shields.io/badge/Type-runtime-orange)
[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/html.svg?logo=npm)](https://www.npmjs.com/package/@papit/html)

---

## Features

- ✅ Zero dependencies
- ✅ Small footprint (~6–7 KB bundled)
- ✅ DOM-inspired API (Document, Element, TextNode)
- ✅ Tree construction from HTML strings
- ✅ `querySelector`, `querySelectorAll`, and `closest`
- ✅ Attribute and class handling
- ✅ `innerHTML` / `outerHTML` serialization
- ✅ Deterministic, explicit behavior (no hidden magic)

---

## Non-goals

`@papit/html` intentionally does **not** aim to fully replicate the browser DOM.

The following are explicitly out of scope:

- ❌ Rendering, layout, or visual output
- ❌ CSS evaluation or computed styles
- ❌ Events and event propagation
- ❌ Mutation observers
- ❌ Shadow DOM
- ❌ Custom elements
- ❌ Full CSS selector grammar (`:nth-child`, `:not`, etc.)
- ❌ Browser HTML error-correction edge cases

The library is ongoing and Custom-elements would be cool ngl.

---

## Installation

```bash
npm install @papit/html
```

---

## Basic usage

```ts
import { Document } from "@papit/html";

const doc = new Document();
doc.innerHTML = `
  <div class="container">
    <h1>Hello World</h1>
    <p class="intro">Welcome to @papit/html!</p>
  </div>
`;

const title = doc.querySelector("h1");
console.log(title?.textContent); // "Hello World"
```

---

## Document

The `Document` represents the root of the DOM tree and is responsible for **creating nodes**.

### Creation

```ts
const doc = new Document();
```

### Methods

- `createElement(tagName: string, options?)`
- `createTextNode(text: string)`
- `querySelector(selector)`
- `querySelectorAll(selector)`

> ⚠️ Elements should be created via `Document.createElement()` to ensure
> correct ownership and parent relationships.

### Serialization

```ts
console.log(doc.outerHTML);
```

Output:

```
#document
<div class="container">
  <h1>Hello World</h1>
  <p class="intro">Welcome to @papit/html!</p>
</div>
```

> Note: `Document.outerHTML` is **not HTML-valid by design**.
> It is intended for debugging and serialization, not browser rendering.

---

## Element

Represents an HTML element node.

### Properties

- `tagName: string`
- `attributes: Record<string, string>`
- `className: string`
- `classList`
- `children: Node[]`
- `parentElement: Element | null` (read-only)
- `textContent: string | null`

### Tree manipulation

```ts
const div = doc.createElement("div");
const span = doc.createElement("span");

div.appendChild(span);
div.removeChild(span);
```

Supported methods:

- `appendChild(node: Node)`
- `removeChild(node: Node)`

---

## HTML content

### innerHTML

```ts
element.innerHTML = "<span>Text</span>";
```

- Clears existing children
- Rebuilds the subtree from the provided HTML

### outerHTML

```ts
console.log(element.outerHTML);
```

Returns the serialized representation of the element and its children.

---

## Querying

### querySelector / querySelectorAll

```ts
const el = doc.querySelector("div.container");
const items = doc.querySelectorAll("p");
```

Supported selector features:

- Tag selectors: `div`
- Class selectors: `.container`
- Attribute selectors: `[id=main]`
- Text selectors: `{Hello}`
- Descendant (` `), child (`>`), and sibling (`+`) combinators

---

## closest

```ts
const el = doc.querySelector("span");
const parent = el?.closest("#parent");
```

Traverses ancestors until a matching element is found.

Behavior matches the browser DOM:

- The element itself is checked first
- Traversal continues via `parentElement`
- Returns `null` if no match is found

---

## Query utility

The internal `Query` helper parses selector strings into structured query parts.

```ts
import { Query } from "@papit/html";

const parts = Query("div.container[role=main]");
```

This is primarily intended for internal use, but is exposed for advanced consumers.

---

## Contributing

Contributions are welcome!

- Keep the library dependency-free
- Maintain deterministic behavior
- Prefer explicit APIs over magic
- Ensure all tests pass before submitting a PR

---

## License

Licensed under the **@Papit License 1.0**
Copyright (c) 2024 Henry Pap (@onkelhoy)

**Key points:**

- ✅ Free to use in commercial projects
- ✅ Free to modify and distribute
- ✅ Attribution required
- ❌ Cannot resell the component itself as a standalone product

See the [LICENSE](https://github.com/onkelhoy/web-components/blob/main/LICENSE) file for full details.

---

## Support

For issues, questions, or contributions, please visit the
[GitHub repository](https://github.com/onkelhoy/web-components).
