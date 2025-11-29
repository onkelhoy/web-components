# @papit/markdown

A lightweight web component for parsing and rendering markdown content with support for code blocks, tables, lists, headings, and more.

---

![Type](https://img.shields.io/badge/Type-organism-orange)
[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/markdown.svg?logo=npm)](https://www.npmjs.com/package/@papit/markdown)

---

## Features

- **Headings**: Support for all heading levels (h1-h6)
- **Code Blocks**: Syntax-highlighted code blocks with language specification
- **Inline Code**: Backtick-wrapped inline code
- **Tables**: Full table support with headers and body rows
- **Lists**: Both ordered and unordered lists
- **Blockquotes**: Quote formatting with `>` prefix
- **Links**: Markdown-style link syntax `[text](url)`
- **Asset Loading**: Extends `Asset` class for loading markdown files from URLs

## Installation

```bash
npm install @papit/markdown
```

## Usage

### HTML

```html
<script type="module" defer>
  import "@papit/markdown";
</script>

<!-- Inline content -->
<pap-markdown> # Hello World This is **markdown** content </pap-markdown>

<!-- Load from file -->
<pap-markdown src="/docs/readme.md"></pap-markdown>
```

### React

```jsx
import { Markdown } from "@papit/markdown/react";

function Component() {
  return <Markdown src="/docs/readme.md" />;
}
```

### JavaScript

```javascript
import { Markdown } from "@papit/markdown";

const markdown = document.createElement("pap-markdown");
markdown.content = `
# My Document
This is a paragraph with **bold** text.
`;
document.body.appendChild(markdown);
```

## API Reference

### Properties

#### `content` (private)

- **Type**: `string`
- **Default**: `""`
- **Description**: The markdown content to render. Set this property to programmatically update the rendered markdown.

#### `assetBase`

- **Type**: `string`
- **Default**: `"/public/markdown"`
- **Description**: Base path for loading markdown assets via the `src` attribute.

### Attributes

#### `src`

Inherited from `Asset` class - specifies the URL of the markdown file to load.

```html
<pap-markdown src="/docs/guide.md"></pap-markdown>
```

## Supported Markdown Syntax

### Headings

```markdown
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
```

### Code Blocks

With language specification:

````markdown
```javascript
function hello() {
  console.log("Hello World");
}
```
````

Inline code block:

```markdown
`const x = 5;`
```

### Inline Code

```markdown
Use `const` to declare constants in JavaScript.
```

### Lists

Unordered lists:

```markdown
- Item 1
- Item 2
- Item 3
```

Ordered lists:

```markdown
1. First item
2. Second item
3. Third item
```

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Blockquotes

```markdown
> This is a quote
> It can span multiple lines
```

### Links

```markdown
[Link text](https://example.com)
```

### Paragraphs

Regular text is automatically wrapped in paragraph tags. Empty lines separate paragraphs.

## Styling

The component uses shadow DOM and can be styled using CSS custom properties. The default styles include:

- Blockquote styling with left border
- Code block integration via `@papit/codeblock`
- Table styling with cell spacing and padding
- Standard paragraph and heading styles

### Custom Styling

```css
pap-markdown {
  /* Your custom styles */
}

/* Style internal elements via ::part() if exposed */
```

## Code Integration

The component integrates with `@papit/codeblock` for syntax highlighting in code blocks. Make sure this dependency is available:

```javascript
import "@papit/codeblock";
```

## Examples

### Loading from URL

```html
<pap-markdown src="/docs/api-guide.md"></pap-markdown>
```

### Dynamic Content

```javascript
const markdown = document.querySelector("pap-markdown");
markdown.content = `
# Dynamic Content
This content was set programmatically at ${new Date().toLocaleString()}.

- Feature 1
- Feature 2
- Feature 3
`;
```

### Complex Document

# Project Documentation

## Overview

This project provides a **markdown parser** for web components.

## Features

- Lightweight and fast
- Shadow DOM encapsulation
- Full markdown support

## Code Example

```javascript
import { Markdown } from "@papit/markdown";
```

## Data Table

| Feature  | Supported |
| -------- | --------- |
| Headings | ✓         |
| Tables   | ✓         |
| Code     | ✓         |

> **Note**: This is still a work in progress!

## Development

Development takes place within the `src` folder. To add a new subcomponent, use the command `npm run component:add`. This command updates the `.env` file, creates a view folder, and adds a subfolder in the `components` folder (creating it if it doesn't exist) inside `src` with all the necessary files.

Styling is managed in the `style.scss` file, which automatically generates a `style.ts` file for use in the component.

### Viewing

To view the component, run `npm start`. This command is equivalent to `npm run start demo` and launches the development server for the demo folder located within the `views` folder. This allows you to preview your component during development.

### Assets

All assets required by the component, such as icons and images for translations, should be placed in the `assets` folder. This folder will already include an `icons` and `translations` folder with an `en.json` file for English translations. Use this structure to organize translations and make them easily accessible for other projects.

For assets used solely for display or demo purposes, create a `public` folder under the relevant directory inside the `views` folder. These assets are not included in the component package.

## Available Commands

- **build**: Builds the component in development mode. Use the `--prod` flag (`npm run build -- --prod`) for a production build, which includes minification.
- **watch**: Watches for changes to the component files and rebuilds them automatically without starting the development server.
- **start**: Starts the development server for a specific demo. The target folder within the `views` directory must contain an `index.html` file. Usage example: `npm run start --name=<folder>`.
- **analyse**: Generates a comprehensive analysis file, mainly useful for React scripts and potentially for generating pages. The analysis file is only generated if it does not exist, unless the `--force` flag is used. Optional flags include `--verbose` and `--force`.
- **react**: Generates the necessary React code based on the web component code, including any subcomponents. The generated code will not overwrite existing files, allowing for manual customization. Flags: `--verbose` & `--force`.

## Browser Support

This component uses modern web standards including:

- Custom Elements (Web Components)
- Shadow DOM
- ES Modules

Ensure your target browsers support these features or include appropriate polyfills.

## Dependencies

- `@papit/core`: Core utilities and decorators
- `@papit/codeblock`: Code syntax highlighting
- `@papit/asset`: Base class for asset loading

## Known Limitations

- **Work in Progress**: This component is still under active development
- Limited markdown syntax support compared to full markdown parsers
- Inline formatting (bold, italic) is not yet implemented
- Nested lists are not supported
- Images are not yet supported
- Horizontal rules are not supported

## Contributing

Contributions are welcome! Please follow the development guidelines above and ensure all tests pass before submitting a pull request.

## License

Licensed under the @Papit License 1.0 - Copyright (c) 2024 Henry Pap (@onkelhoy)

**Key points:**

- ✅ Free to use in commercial projects
- ✅ Free to modify and distribute
- ✅ Attribution required
- ❌ Cannot resell the component itself as a standalone product

See the [LICENSE](https://github.com/onkelhoy/web-components/blob/main/LICENSE) file for full details.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/onkelhoy/web-components).
