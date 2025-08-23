# Markdown

[![Github Repo](https://img.shields.io/badge/Git-@papit/markdown-blue?logo=github&link=https://github.com/onkelhoy/web-components/tree/main/packages/organisms/markdown)](https://github.com/onkelhoy/web-components/tree/main/packages/organisms/markdown)
![Layer Type](https://img.shields.io/badge/Layer_Type-organism-orange)

[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/markdown.svg?logo=npm)](https://www.npmjs.com/package/@papit/markdown)

## Use Case

### installation

```bash
npm install @papit/markdown
```

### to use in **html**

```html
<script type="module" defer>
  import "@papit/markdown";
</script>

<pap-markdown></pap-markdown>
```

### to use in **react**

```jsx
import { Markdown } from "@papit/markdown/react";

function Component() {
  return (
    <Markdown /> 
  )
}
```

## Development

Development takes place within the `src` folder. To add a new subcomponent, use the command `npm run component:add`. This command updates the `.env` file, creates a view folder, and adds a subfolder in the `components` folder (creating it if it doesn't exist) inside `src` with all the necessary files.

Styling is managed in the `style.scss` file, which automatically generates a `style.ts` file for use in the component.

## Viewing

To view the component, run `npm start`. This command is equivalent to `npm run start demo` and launches the development server for the demo folder located within the `views` folder. This allows you to preview your component during development.

## Assets

All assets required by the component, such as icons and images for translations, should be placed in the `assets` folder. This folder will already include an `icons` and `translations` folder with an `en.json` file for English translations. Use this structure to organize translations and make them easily accessible for other projects.

For assets used solely for display or demo purposes, create a `public` folder under the relevant directory inside the `views` folder. These assets are not included in the component package.

## Commands

- **build**: Builds the component in development mode. Use the `--prod` flag (`npm run build -- --prod`) for a production build, which includes minification.
- **watch**: Watches for changes to the component files and rebuilds them automatically without starting the development server.
- **start**: Starts the development server for a specific demo. The target folder within the `views` directory must contain an `index.html` file. Usage example: `npm run start --name=<folder>`.
- **analyse**: Generates a comprehensive analysis file, mainly useful for React scripts and potentially for generating pages. The analysis file is only generated if it does not exist, unless the `--force` flag is used. Optional flags include `--verbose` and `--force`.
- **react**: Generates the necessary React code based on the web component code, including any subcomponents. The generated code will not overwrite existing files, allowing for manual customization. Flags: `--verbose` & `--force`.
