# @papit/aside

A versatile slide-in panel component for creating sidebars, drawers, and off-canvas navigation with customizable placement, elevation, and behavior.

---

![Type](https://img.shields.io/badge/Type-molecule-orange)
[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/aside.svg?logo=npm)](https://www.npmjs.com/package/@papit/aside)

---

## Quick Start

### Installation

```bash
npm install @papit/aside
```

### Basic Usage

#### HTML

```html
<script type="module" defer>
  import "@papit/aside";
</script>

<pap-aside open>
  <h2>Sidebar Content</h2>
  <p>Your content here</p>
</pap-aside>
```

#### React

```jsx
import { Aside } from "@papit/aside/react";

function Component() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Sidebar</button>
      <Aside open={isOpen} onHide={() => setIsOpen(false)} placement="right">
        <h2>Sidebar Content</h2>
        <p>Your content here</p>
      </Aside>
    </>
  );
}
```

## Features

- **Flexible Placement**: Position on left, right, top, or bottom
- **Auto-close**: Optional click-outside-to-close behavior
- **Backdrop Support**: Optional overlay backdrop
- **Elevation Styles**: Configurable shadow and depth effects
- **Custom Dimensions**: Adjustable width for horizontal panels
- **Multiple Modes**: Different visual and behavioral modes
- **Event-driven**: Show/hide events for integration
- **Accessible**: Shadow DOM encapsulation with part-based styling

## API Reference

### Properties

#### `open`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Controls the visibility of the aside panel. Set to `true` to show, `false` to hide.

```html
<pap-aside open></pap-aside>
```

#### `placement`

- **Type**: `"left" | "right" | "top" | "bottom"`
- **Default**: `"right"`
- **Description**: Determines which side of the viewport the aside slides in from.

```html
<pap-aside placement="left"></pap-aside>
```

#### `backdrop`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show an overlay backdrop behind the aside panel.

```html
<pap-aside backdrop="false"></pap-aside>
```

#### `hideonoutsideclick`

- **Type**: `boolean`
- **Default**: `true`
- **Attribute**: `hideonoutsideclick`
- **Description**: Automatically closes the aside when clicking outside of it.

```html
<pap-aside hideonoutsideclick="false"></pap-aside>
```

#### `radius`

- **Type**: `"none" | "small" | "medium" | "large"`
- **Default**: `"medium"`
- **Description**: Controls the border radius of the aside panel.

```html
<pap-aside radius="large"></pap-aside>
```

#### `elevation`

- **Type**: `"none" | "low" | "medium" | "high"`
- **Default**: `"none"`
- **Description**: Sets the shadow depth/elevation of the aside panel.

```html
<pap-aside elevation="medium"></pap-aside>
```

#### `elevationdirection`

- **Type**: `"horizontal" | "vertical"`
- **Default**: `"vertical"`
- **Attribute**: `elevation-direction`
- **Description**: Direction of the elevation/shadow effect.

```html
<pap-aside elevation="medium" elevation-direction="horizontal"></pap-aside>
```

#### `mode`

- **Type**: `"normal" | ...` (extensible)
- **Default**: `"normal"`
- **Description**: Visual or behavioral mode variant for the aside.

```html
<pap-aside mode="normal"></pap-aside>
```

#### `width`

- **Type**: `string`
- **Default**: `undefined`
- **Description**: Custom width for the aside panel. Accepts CSS units (px, %, rem, etc.) or plain numbers (treated as pixels).

```html
<pap-aside width="300px"></pap-aside> <pap-aside width="400"></pap-aside>
```

### Methods

#### `show()`

Programmatically opens the aside panel and dispatches a `show` event.

```javascript
const aside = document.querySelector("pap-aside");
aside.show();
```

#### `hide()`

Programmatically closes the aside panel and dispatches a `hide` event.

```javascript
const aside = document.querySelector("pap-aside");
aside.hide();
```

### Events

#### `show`

Fired when the aside panel is opened.

```javascript
aside.addEventListener("show", () => {
  console.log("Aside opened");
});
```

#### `hide`

Fired when the aside panel is closed (either programmatically or via outside click).

```javascript
aside.addEventListener("hide", () => {
  console.log("Aside closed");
});
```

### Slots

#### Default Slot

All content placed inside the `<pap-aside>` tags will be rendered in the panel.

```html
<pap-aside>
  <nav>
    <a href="/home">Home</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
</pap-aside>
```

### CSS Parts

Style internal elements using the `::part()` selector:

- `wrapper`: The main container of the aside panel
- `accordion`: Internal accordion wrapper
- `group`: Content group wrapper
- `content`: The content container

```css
pap-aside::part(wrapper) {
  background: linear-gradient(to bottom, #fff, #f5f5f5);
}

pap-aside::part(content) {
  padding: 2rem;
}
```

### CSS Custom Properties

#### `--aside-width`

Automatically set by the `width` property, but can be overridden directly.

```css
pap-aside {
  --aside-width: 350px;
}
```

## Examples

### Navigation Sidebar

```html
<button id="menuBtn">☰ Menu</button>

<pap-aside id="nav" placement="left" width="280px">
  <nav>
    <h2>Navigation</h2>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#products">Products</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
</pap-aside>

<script>
  const aside = document.getElementById("nav");
  const btn = document.getElementById("menuBtn");

  btn.addEventListener("click", () => aside.show());
</script>
```

### Settings Panel

```html
<pap-aside placement="right" width="400px" elevation="high" radius="large">
  <div class="settings">
    <h2>Settings</h2>
    <form>
      <label>
        <input type="checkbox" name="notifications" />
        Enable Notifications
      </label>
      <label>
        <input type="checkbox" name="darkMode" />
        Dark Mode
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
</pap-aside>
```

### Modal-like Aside (No Outside Click Close)

```html
<pap-aside hideonoutsideclick="false" backdrop="true" placement="right">
  <div>
    <h2>Confirm Action</h2>
    <p>Are you sure you want to proceed?</p>
    <button id="confirm">Confirm</button>
    <button id="cancel">Cancel</button>
  </div>
</pap-aside>

<script>
  const aside = document.querySelector("pap-aside");
  document.getElementById("cancel").addEventListener("click", () => {
    aside.hide();
  });
</script>
```

### Responsive Dashboard Sidebar

```jsx
import { Aside } from "@papit/aside/react";
import { useState, useEffect } from "react";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      {isMobile && <button onClick={() => setSidebarOpen(true)}>☰</button>}

      <Aside
        open={isMobile ? sidebarOpen : true}
        hideonoutsideclick={isMobile}
        backdrop={isMobile}
        placement="left"
        width="280px"
        onHide={() => setSidebarOpen(false)}
      >
        <nav>
          <h2>Dashboard</h2>
          <ul>
            <li>Overview</li>
            <li>Analytics</li>
            <li>Reports</li>
            <li>Settings</li>
          </ul>
        </nav>
      </Aside>

      <main>{/* Main content */}</main>
    </div>
  );
}
```

### Top Notification Bar

```html
<pap-aside
  placement="top"
  elevation="medium"
  elevationdirection="vertical"
  hideonoutsideclick="false"
>
  <div class="notification">
    <p>🎉 New features available! Check them out.</p>
    <button id="dismiss">Dismiss</button>
  </div>
</pap-aside>
```

## Styling

The component uses Shadow DOM for style encapsulation. Customize appearance using CSS parts or custom properties.

### Example Custom Styles

```css
/* Customize the wrapper */
pap-aside::part(wrapper) {
  background: white;
  border-left: 3px solid #007bff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

/* Customize content padding */
pap-aside::part(content) {
  padding: 2rem;
  max-height: 100vh;
  overflow-y: auto;
}

/* Adjust width */
pap-aside.wide {
  --aside-width: 500px;
}
```

### Placement-specific Styling

```css
/* Left sidebar */
pap-aside[placement="left"]::part(wrapper) {
  border-right: 1px solid #e0e0e0;
}

/* Right sidebar */
pap-aside[placement="right"]::part(wrapper) {
  border-left: 1px solid #e0e0e0;
}
```

## Accessibility

- Uses semantic HTML structure
- Supports keyboard navigation through slotted content
- Event-driven API for screen reader announcements
- Consider adding `role="dialog"` or `role="navigation"` to slotted content
- Add `aria-label` or `aria-labelledby` for better context

```html
<pap-aside>
  <nav aria-label="Main navigation">
    <!-- navigation content -->
  </nav>
</pap-aside>
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
- ES Modules

Ensure your target browsers support these features or include appropriate polyfills.

## Dependencies

- `@papit/core`: Core utilities, decorators, and base component class

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import type {
  Placement,
  Mode,
  Elevation,
  ElevationDirection,
  Radius,
} from "@papit/aside";
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
