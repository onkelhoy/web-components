# @pap-it Ecosystem: An Overview

Welcome to the `@pap-framework` ecosystem, an innovative framework designed to revolutionize the development and deployment of web components. Developed by Henry Pap, this ecosystem is built on a zero-dependency philosophy in production environments, promoting modular development, performance enhancement, and security. It offers a comprehensive toolkit for developers, encouraging efficiency and creativity in web application development.

**Author**: Henry Pap\
**GitHub**: [onkelhoy](https://github.com/onkelhoy/web-components)\
**License**: MIT

## Important Compatibility Note

Currently, this project is optimized for macOS, as it relies on `fswatch` for monitoring file system events. Linux support is planned with the integration of the `fswatch` npm package. Windows compatibility is limited due to the reliance on Unix commands. We are looking into expanding support for Windows in future updates.

## Quick Start Guide

This guide will quickly set up your development environment so you can start using the framework efficiently.

### Prerequisites

- **Operating System**: Designed primarily for macOS. Future updates are aimed to include Linux support.
- **Homebrew**: The initialization script uses Homebrew to install `fswatch`. Ensure you have Homebrew installed on your macOS system. Installation instructions can be found on the [official Homebrew website](https://brew.sh/).

### Getting Started

1. **Navigate to the Project's Root Directory**: Open your Terminal and change to the project's root directory with `cd path/to/your/project`.

2. **Run the Initialization Script**: Execute the following command. This will check for the presence of `fswatch`, prompt for its installation if necessary, and install any additional required packages.

   ```bash
   npm run init
   ```

   Follow the on-screen prompts to complete the installation process.

3. **Setup Complete**: With the successful execution of the initialization script, your development environment is now ready.

### Ready, Set, Code

You are all set to begin developing with the framework. The setup has taken care of the necessary tooling and dependencies. Dive into creating, developing, and managing your components within our innovative ecosystem.

For further guidance on developing components, managing assets, and utilizing framework commands, refer to the detailed documentation provided with the framework. Happy coding!

## Abstract

The `@pap-it` ecosystem exemplifies the strength of community collaboration and open-source innovation. By minimizing external dependencies, it ensures lean and efficient applications while providing developers the freedom to build, customize, and extend web components effortlessly. This document aims to be your detailed guide through the `@pap-it` landscape, from understanding its structure to creating, developing, and publishing your web components.

Dive into the following sections for a deep dive into `@pap-it`, and join us in shaping the future of web development.

## Contributions

We welcome community contributions, including bug reports, suggestions for improvements, and code contributions. Your involvement is highly valued. For more details on how to contribute, please visit our [Contributions page](./CONTRIBUTING.md).

## License

`@pap-it` is licensed under the MIT License. This permissive license allows for maximum flexibility in using, modifying, and distributing the software, provided attribution is given, and liability is not assumed. See the [LICENSE file](./LICENSE) for details.

## Acknowledgments

Special thanks to everyone who supported this project. Notably, **Vilcini, Adrien**, a key designer responsible for the aesthetic of many components. His work can be viewed on [Figma](https://www.figma.com/file/Ok5aSJW5KqgusO5MuYui6q/Circular-Design-System-(CDS)?type=design&node-id=2669-25209&mode=design&t=22qOpUOq1GEoV6F5-0). My gratitude also extends to **Dolo, Adama**, my boss, who has been a significant supporter of this project. Additionally, heartfelt thanks to my family, friends, and my partner **Dao, Phuong**, for their unwavering mental support.

## Further Reading

Enhance your understanding and utilization of the `@pap-it` ecosystem with these resources:

1. [How to Use `@pap-it`](./documentation/how-to-use.md)
2. [A Closer Look at `@pap-it`](./documentation/global.md)
3. [Individual Packages Overview](./documentation/package.md)
4. [Theming with `@pap-it`](./themes/README.md)
5. [Understanding Versioning in `@pap-it`](./scripts/versioning/README.md)
