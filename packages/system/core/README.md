# @papit/core

[![Github Repo](https://img.shields.io/badge/Git-@papit/core-blue?logo=github&link=https://github.com/onkelhoy/web-components/tree/main/packages/core)](https://github.com/onkelhoy/web-components/tree/main/packages/core)
![Layer Type](https://img.shields.io/badge/Layer_Type-core-orange)

[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/core.svg?logo=npm)](https://www.npmjs.com/package/@papit/core)

---

## Overview

**`@papit/core`** is a lightweight foundation for building fast, declarative web components — with powerful decorators, efficient HTML template rendering, and handy utilities.

It’s minimal, framework-agnostic, and designed to be easy to integrate into both small standalone widgets and large-scale design systems.

### Documentation

📄 **[Full Documentation →](./docs/README.md)**

### Acknowledgements

💌 Special thanks to my loving wife **Phuong** — your support and patience make all the difference. 💛

shoutout **Christian Norrman** to my collegue who opened my eyes for the way we can only update values without having to do hard core element diffing like previous versions

---

## Development Workflow

Development takes place inside the `src` folder.

### Adding a new subcomponent

```bash
npm run component:add
```

This will:

- Update `.env`
- Create a view folder
- Create the corresponding folder under `src/components`
- Generate starter files

---

## Styling

- Edit styles in `style.scss`
- Styles are automatically compiled into `style.ts` for component consumption

---

## Live Preview

To preview during development:

```bash
npm start
```

This launches a demo server from the `views` folder.

---

## Assets

- **Component assets** (icons, translations, etc.) → store in `assets/`
- **Demo-only assets** → store in `views/<demo>/public/`

---

## Available Commands

| Command     | Description                                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| **build**   | Builds the component. Add `--prod` for minification.                               |
| **watch**   | Watches for file changes and rebuilds.                                             |
| **start**   | Starts the demo server for a specific view.                                        |
| **analyse** | Generates an analysis file (with `--verbose` and/or `--force` flags).              |
| **react**   | Generates React wrappers for components (with `--verbose` and/or `--force` flags). |

---

## Example — Creating a Counter Component

Below is a small but complete example showing several key features in `@papit/core`:

- **Reactive properties** via `@property`
- **DOM queries** via `@query`
- **Event debouncing** via `@debounce` and `debounceFn`
- **Method binding** via `@bind`
- **Declarative rendering** via the `html` tag

```ts
import {
  CustomElement,
  html,
  property,
  query,
  debounce,
  bind,
  debounceFn,
} from "@papit/core";

class MyCounter extends CustomElement {
  @property({ type: Number }) count = 0;
  @query("#incBtn") incrementButton!: HTMLButtonElement;

  @debounce(300)
  handleIncrement() {
    this.count++;
  }

  @bind
  handleReset() {
    this.count = 0;
  }

  render() {
    return html`
      <h2>Count: ${this.count}</h2>
      <button id="incBtn" @click=${this.handleIncrement}>+1</button>
      <button @click=${this.handleReset}>Reset</button>
    `;
  }
}

customElements.define("my-counter", MyCounter);
```

Once registered, you can use it anywhere:

```html
<my-counter></my-counter>
```
