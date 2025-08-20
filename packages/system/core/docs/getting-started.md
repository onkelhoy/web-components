# Getting Started

## Installation

```bash
npm install @papit/core
````

## Your First Component

```ts
import { CustomElement, html } from "@papit/core";

class HelloWorld extends CustomElement {
  render() {
    return html`<h1>Hello World</h1>`;
  }
}

customElements.define("hello-world", HelloWorld);
```

---

## Usage in HTML

```html
<script type="module" src="./HelloWorld.js"></script>
<hello-world></hello-world>
```

---

## Usage in React 
> NOTE: react suppoet is not yet implemented 

```jsx
import { HelloWorld } from "@papit/core/react";

export default function App() {
  return <HelloWorld />;
}
```