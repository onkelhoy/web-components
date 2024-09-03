# Papit Server

Papit Server is the only web server you'll need.


[![Github Repo](https://img.shields.io/badge/Git-@papit/server-blue?logo=github&link=https://github.com/onkelhoy/web-components/tree/main/packages/systems/server)](https://github.com/onkelhoy/web-components/tree/main/packages/systems/server)
![Layer Type](https://img.shields.io/badge/Layer_Type-system-orange)

[![Tests](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml/badge.svg)](https://github.com/onkelhoy/web-components/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/@papit/server.svg?logo=npm)](https://www.npmjs.com/package/@papit/server)

## Introduction

`@papit/server` is a highly configurable, lightweight static file server designed to serve your content dynamically while intelligently handling dependencies and assets. By leveraging [esbuild](https://esbuild.github.io/), the server compiles JavaScript on-the-fly, ensuring optimal performance and seamless integration with themes and assets. Ideal for applications requiring rapid setup, flexibility, and scalability, `@papit/server` provides built-in support for themes, bundles, and fallback mechanisms.

Whether you're developing a theme-driven application or need to serve static files with precision, `@papit/server` helps you stay in control with its customizable configurations and robust dependency management.

## Features

- **Dynamic Compilation:** All JavaScript files are compiled on-the-fly using `esbuild`, ensuring fast and optimized serving of your assets.
- **Theme Support:** Serve themes or theme bundles, with automatic fallback to a default (`core`) if no specific theme is found.
- **Asset Management:** Automatically detects and serves assets like `public`, `assets`, and custom asset directories through a smart dependency extraction mechanism.
- **Customizable Templates:** Easily customize the error page (`404`), directory listings, and common template wrappers.
- **Live Reload:** Optionally enables live reloading with the `--live` flag for development convenience.
- **Configurable Ports and Logs:** Control the server's port, logging verbosity, and location through straightforward CLI flags.
- **Robust Cleanup:** Ensures smooth process shutdowns, including clean handling of temporary files and server termination signals.

## Getting Started

To install `@papit/server`:

```bash
npm install @papit/server
```

Once installed, you can start serving your static files by specifying the location of your content:

```bash
npx @papit/server --location=/path/to/your/files
```

## CLI Options

`@papit/server` offers a variety of command-line options to control how your content is served:

- **`--location=<path>`**: Specifies the directory from which files will be served.
- **`--port=<number>`**: Changes the server port (default: `3000`).
- **`--log-level=<level>`**: Sets the log level (`none`, `verbose`, `critical`, `debug`).
- **`--theme=<name>`**: Specifies the theme to be used.
- **`--live`**: Enables live reloading for development purposes.
- **`--output-translations=<path>`**: Exports translations to the specified directory.
- **`--open`**: Automatically opens the server URL in your default browser.
- **Template Options**: Customize paths to HTML templates:
  - `--notfound=<path>`: Path to the 404 error page.
  - `--directory=<path>`: Path to the directory listing template.
  - `--common=<path>`: Path to a common template wrapper.

## Example Usage

Here’s an example of starting the server with specific options:

```bash
npx @papit/server --location=./public --port=8080 --theme=dark --log-level=debug --open
```

This starts the server on port `8080`, using the `dark` theme, enables debug-level logs, and automatically opens the server in your browser.

## Asset Management

`@papit/server` is designed to intelligently manage and serve assets. It traverses your project directories to locate asset folders (e.g., `public`, `assets`) and avoid conflicts with similarly named packages. The server dynamically extracts dependencies, ensuring all assets are served correctly.

## Themes

You can serve multiple themes, or even bundles of themes, by ensuring they share the same name pattern. If a theme isn't found, the server will fallback to the `core` theme by default, making theme handling simple and reliable.

## Custom Dependency Management

The server utilizes a smart system for managing project dependencies. It scans your `package-lock.json` to locate and load packages, allowing for cross-package dependencies within a monorepo. Only relevant local dependencies are loaded, ensuring an optimized and modular approach to serving assets. 
