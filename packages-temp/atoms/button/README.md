# @papit/button

A versatile, accessible button component with support for multiple variants, sizes, colors, and form integration.

---

[![Github Repo](https://img.shields.io/badge/Git-@papit/button-blue?logo=github&link=https://github.com/onkelhoy/web-components/tree/main/packages/atoms/button)](https://github.com/onkelhoy/web-components/tree/main/packages/atoms/button)
![Type](https://img.shields.io/badge/Type-atom-orange)
[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/button.svg?logo=npm)](https://www.npmjs.com/package/@papit/button)

---

## Quick Start

### Installation

```bash
npm install @papit/button
```

### Basic Usage

#### HTML

```html
<script type="module" defer>
  import "@papit/button";
</script>

<pap-button>Click me</pap-button>
```

#### React

```jsx
import { Button } from "@papit/button/react";

function Component() {
  return <Button>Click me</Button>;
}
```

## Features

- **Multiple Variants**: Filled, outlined, text, and more
- **Color Themes**: Primary, secondary, tertiary, danger, and custom colors
- **Flexible Sizing**: Small, medium, large options
- **Form Integration**: Works with native HTML forms (submit/reset)
- **Link Support**: Can act as a navigation link with href attribute
- **Accessibility**: Full keyboard navigation and ARIA support
- **Customizable**: Adjustable radius, mode, and styling options

## API Reference

### Properties

#### `variant`

- **Type**: `"filled" | "outlined" | "clear"`
- **Default**: `"filled"`
- **Description**: Visual style variant of the button.

```html
<pap-button variant="filled">Filled Button</pap-button>
<pap-button variant="outlined">Outlined Button</pap-button>
<pap-button variant="clear">Clear Button</pap-button>
```

#### `color`

- **Type**: `"primary" | "secondary" | "tertiary" | "error" | "warning" | "information" | "success"`
- **Default**: `"primary"`
- **Description**: Color theme of the button.

```html
<pap-button color="primary">Primary</pap-button>
<pap-button color="error">Delete</pap-button>
<pap-button color="success">Save</pap-button>
<pap-button color="warning">Warning</pap-button>
<pap-button color="information">Info</pap-button>
```

#### `size`

- **Type**: `"small" | "medium" | "large"`
- **Default**: `"medium"`
- **Description**: Size of the button.

```html
<pap-button size="small">Small</pap-button>
<pap-button size="medium">Medium</pap-button>
<pap-button size="large">Large</pap-button>
```

#### `radius`

- **Type**: `"small" | "medium" | "large" | "circle"`
- **Default**: `"circle"`
- **Description**: Border radius style of the button.

```html
<pap-button radius="small">Small Radius</pap-button>
<pap-button radius="medium">Medium Radius</pap-button>
<pap-button radius="large">Large Radius</pap-button>
<pap-button radius="circle">Circle Radius</pap-button>
```

#### `mode`

- **Type**: `"hug" | "fill"`
- **Default**: `"hug"`
- **Description**: Layout mode determining how the button fits its content. `hug` fits content tightly, `fill` expands to container width.

```html
<pap-button mode="hug">Hug Content</pap-button>
<pap-button mode="fill">Fill Container</pap-button>
```

#### `type`

- **Type**: `"button" | "submit" | "reset"`
- **Default**: `"button"`
- **Description**: Button type for form interaction. Works with native HTML forms.

```html
<form>
  <input type="text" name="username" />
  <pap-button type="submit">Submit</pap-button>
  <pap-button type="reset">Reset</pap-button>
</form>
```

#### `href`

- **Type**: `string`
- **Default**: `undefined`
- **Description**: When set, the button acts as a navigation link.

```html
<pap-button href="/dashboard">Go to Dashboard</pap-button>
```

#### `disabled`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Disables the button, preventing any interaction.

```html
<pap-button disabled>Disabled Button</pap-button>
```

#### `readonly`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Makes the button read-only, preventing clicks but maintaining visual state.

```html
<pap-button readonly>Read Only</pap-button>
```

### Slots

#### Default Slot

Content placed inside the button tags.

```html
<pap-button>
  <span>Click me</span>
</pap-button>
```

### Accessibility

- Automatically sets `role="button"` for proper screen reader support
- Keyboard accessible with Enter key support
- Respects `tabindex` attribute (defaults to 0 if not set)
- Supports `disabled` and `readonly` states
- Works seamlessly with native form elements

## Examples

### Primary Action Button

```html
<pap-button variant="filled" color="primary"> Save Changes </pap-button>
```

### Danger Action

```html
<pap-button variant="filled" color="error"> Delete Account </pap-button>
```

### Success Action

```html
<pap-button variant="filled" color="success"> Confirm Payment </pap-button>
```

### Warning Action

```html
<pap-button variant="filled" color="warning"> Proceed with Caution </pap-button>
```

### All Variants

```html
<pap-button variant="filled" color="primary"> Filled Button </pap-button>
<pap-button variant="outlined" color="primary"> Outlined Button </pap-button>
<pap-button variant="clear" color="primary"> Clear Button </pap-button>
```

### Button Sizes and Modes

```html
<!-- Different sizes -->
<pap-button size="small">Small</pap-button>
<pap-button size="medium">Medium</pap-button>
<pap-button size="large">Large</pap-button>

<!-- Different modes -->
<div style="width: 300px;">
  <pap-button mode="hug">Hug Content</pap-button>
  <pap-button mode="fill">Fill Container</pap-button>
</div>
```

### Button Radius Options

```html
<pap-button radius="small">Small Radius</pap-button>
<pap-button radius="medium">Medium Radius</pap-button>
<pap-button radius="large">Large Radius</pap-button>
<pap-button radius="circle">Circle Radius</pap-button>
```

### Form Integration

```html
<form id="myForm">
  <input type="email" name="email" required />
  <pap-button type="submit" color="primary"> Sign Up </pap-button>
  <pap-button type="reset" variant="outlined"> Clear Form </pap-button>
</form>
```

### Navigation Button

```html
<pap-button href="/products" variant="filled" color="primary">
  Browse Products
</pap-button>
```

### Button States

```html
<!-- Normal button -->
<pap-button>Normal</pap-button>

<!-- Disabled button -->
<pap-button disabled>Disabled</pap-button>

<!-- Read-only button -->
<pap-button readonly>Read Only</pap-button>
```

### React Examples

#### Basic Button

```jsx
import { Button } from "@papit/button/react";

function MyComponent() {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  return <Button onClick={handleClick}>Click me</Button>;
}
```

#### Button Group

```jsx
function ButtonGroup() {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Button variant="filled" color="primary">
        Save
      </Button>
      <Button variant="outlined" color="secondary">
        Cancel
      </Button>
      <Button variant="text">Skip</Button>
    </div>
  );
}
```

#### Form Submit Button

```jsx
function LoginForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <Button type="submit" color="primary">
        Log In
      </Button>
    </form>
  );
}
```

#### Conditional Button States

```jsx
function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveData();
    setIsSaving(false);
  };

  return (
    <Button onClick={handleSave} disabled={isSaving} color="primary">
      {isSaving ? "Saving..." : "Save"}
    </Button>
  );
}
```

## Styling

The component uses Shadow DOM for style encapsulation. Customize the appearance using CSS custom properties or by targeting the component itself.

### Example Custom Styles

```css
pap-button {
  --button-padding: 12px 24px;
  --button-font-size: 16px;
  --button-border-width: 2px;
}

/* Variant-specific styling */
pap-button[variant="filled"] {
  --button-background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

/* Size-specific styling */
pap-button[size="large"] {
  font-size: 18px;
}
```

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
- ElementInternals API (for form integration)
- ES Modules

Ensure your target browsers support these features or include appropriate polyfills.

## Dependencies

- `@papit/core`: Core utilities, decorators, and base component class

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import type { Color, Mode, Radius, Size, Type, Variant } from "@papit/button";
```

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

## Related Components

- [@papit/core](https://github.com/onkelhoy/web-components/tree/main/packages/system/core): Core utilities, decorators, and base component class

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/onkelhoy/web-components).
