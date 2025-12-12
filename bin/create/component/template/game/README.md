# PLACEHOLDER_FULL_NAME

Whops, abstract is missing!

---

![Type](https://img.shields.io/badge/Type-PLACEHOLDER_LAYER_NAME-orange)
[![Tests](PLACEHOLDER_GITHUB_REPO/actions/workflows/pull-request.yml/badge.svg)](PLACEHOLDER_GITHUB_REPO/actions/workflows/pull-request.yml)
[![NPM version](https://img.shields.io/npm/v/PLACEHOLDER_FULL_NAME.svg?logo=npm)](https://www.npmjs.com/package/PLACEHOLDER_FULL_NAME)

---

## Development

Development takes place within the `src` folder. To add a new subcomponent, use the command `npm run component:add`. This command updates the `.env` file, creates a view folder, and adds a subfolder in the `components` folder (creating it if it doesn't exist) inside `src` with all the necessary files.

Styling is managed in the `style.scss` file, which automatically generates a `style.ts` file for use in the component.

## Viewing

To view the component, run `npm start`. This command is equivalent to `npm run start demo` and launches the development server for the demo folder located within the `views` folder. This allows you to preview your component during development. Since it's a game it has special view playground using the `@papit/game-engine` together with the `@papit/game-input-events`.

## Assets

All assets required by the component, such as icons and images for translations, should be placed in the `assets` folder. This folder will already include a `textures`, `files` and `translations` folder with an `en.json` file for English translations. Use this structure to organize translations and make them easily accessible for other projects.

For assets used solely for display or demo purposes, create a `public` folder under the relevant directory inside the `views` folder. These assets are not included in the component package.

## Commands

- **build**: Builds the component in development mode. Use the `--prod` flag (`npm run build -- --prod`) for a production build, which includes minification.
- **watch**: Watches for changes to the component files and rebuilds them automatically without starting the development server.
- **start**: Starts the development server for a specific demo. The target folder within the `views` directory must contain an `index.html` file. Usage example: `npm run start --name=<folder>`.

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

## Related Games

PLACEHOLDER_RELATED_GAMES

<!-- Example:
- `@papit/game-snake`: Classic snake game implementation
- `@papit/game-tetris`: Tetris puzzle game
- `@papit/game-pong`: Two-player pong game
-->

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/onkelhoy/web-components).
