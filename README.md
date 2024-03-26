# @pap-it

## Table of contents

1. [Introduction](#introduction)
2. [Folder structure](#folder-structure)
    1. [Packages](#packages)
        1. [Overall](#overall)
        2. [Individual](#individual)
            1. [Local Scripts](#scripts-local)
    2. [Global Scripts](#scripts-global)
3. [How to use](#how-to-use-general-scope)
    1. [How to create new component](#how-to-create-new-component)
    2. [How to run a component (start)](#how-to-run-a-component-start)
4. [Build/Publish](#buildpublish)
    1. [How to build all components](#how-to-build-all-components)
    2. [How to publish](#how-to-publish)

## Introduction

Welcome to my ecosystem building web-components. Theres many things going on here and I hope that one day soon there will be a wiki page that will address each individual piece at isolation.

But in general this is a zero-dependency library (at produciton) that tries to use as little as possible to develop and ship web components. Almost everything from dev-server to rendering engine has been developed by scratch and its all open source to be able to see how it works and potentially modify to fit your own case.

Many things do come out of the box, such as analyzing code to get properties, events etc to use these to build some generative pages

TODO give a more overview what global and local would mean (case of scripts we have global scripts at root but also individually at packages)

## Folder structure

The overall structure is of following (besides the obvious ones `.github, .vscode etc`):

``` bash
- asset 
# this is where global level assets would occur, note that a package does not include them when published
- packages
# this is where all our packages exists 
- scripts 
# this is where all the things exists to make 0 dependency
- themes
# a place for all themes where "base" is the initial theme 
- web 
# a output folder when generating the global view (currently not working)
```

It's worth to mention that the only place I'd recommend to look into is `packages` and maybe `themes` the rest should not really have to be looked into unless specific reasons too.

### Packages

The packages are structured in same way - more on this in the section [Individual](#individual). The packages follows a layered style architecture meaning that we extend certain classes to get their properties, methods etc. In order to keep the list of layered folder size small a off the side folder is introduces (currently called `templates` but will change in future). This exists in order to avoid having the layered folders too many layers and a package in layer one can extend properties from - its kind of a architecture breaker to keep things clean basically.

#### Overall

**This will change heavily in the near feature.**
The folder structure of packages (for now) is a expanded verion of `atomic layered architecture`. It introduces 2 more layers `system` & `tools` where system is used primarily for system-related stuff such as internal rendering, decorators etc inside the utils folder and tools is used to introduce the overal system with components that should be used like a tool (translator e.g.).

1. atoms
2. molecules
3. organisms
4. pages
5. templates
6. tools
7. system

#### Individual

The individual scope of a arbitraty package tries to follow a very clean structure based on common web related domain. For example we see `views, asset` folder which would normally exists of a server-side-rendering (SSR) project structure with exceptions of asset (moslty called public - more on this soon).

The overall structure of a arbitraty package is as follows:

```
.scripts/
asset/
react/
views/
src/
test/
custom-elements.json
package.json
README.md
tsconfig.json
.env
```

Lets break down some simple folders and files first.

- `package.json` this should be obvious but its where our npm package is defined.
- `tsconfig.json` this should also be obvious, its the typescript configuration file.
- `.env` contains useful information for the scripts to run smoother (they should not be changed but feel free to add more envronment variables as you please).
- `custom-elements.json` this is not always there but if `npm run analyse` has been run (or any other scritps that would run just that) we get this which is basically just a analyse of our component/sub-components.
- `test` is not implemented at the moment but all our test cases would exist here.
- `asset` contains all assets that we want our package to be shipped with, select comes with a caret icon for example. Translation files is also included here.

#### .scripts local

The scripts folder inside a package is considered as **`local`** throughout the scope of documentation. Here we find many helper scripts to deal with calling `global` scripts (`root/scripts`), running certain codes etc. The basic scripts are (which can be called with `npm run <name>`: \
**OBS**: in order to pass argument to bash thats called via npm is the following \
`npm run build -- --prod`

- `build` the build calls tsc package to execute, on the output it executes esbuild to "minify" them each. This script can be called with `--prod` flag which would not output source-maps and would do the minification mentioned earlier.
- `watch` this would call typescript with watch mode - useful for debugging.
- `start` (combination of 1 & 2) and then executes the global/version script with reference to one of the view folders. A reference argument can be passed to start different folders (name of view folder is expected, default is the `demo` - `npm start demo` is eqivalent of `npm start`)
- `analyse` this would call the global analyse script to compute information based on the package code. Both `--force` and `--verbose` flags can be passed.
- `react` this would call the global react script that would generate react code, it would also call analyse. Both `--force` and `--verbose` flags can be passed.
- `isolate` this would bundle a complete output including all dependencies - not very useful execpt cases like debug or testing.

##### react

A bit short on the react folder. This mostly is a generated folder if run `npm run react` inside the script. If the folder exists this script would skip to generate unless run with `--force` flag. This allows us to further modify whatever the generated code gave us to fit the use case better if needed.

The outline of the react folder (when generated follows)

```bash
declerations.d.ts
index.ts
<sub-component-classname>.tsx
<component-classname>.tsx
```

Where `declerations` exposes our custom-element to react friendly environment. The `index.ts` much like the index found inside src is responsible of exposing all react codes (combining main class with potential sub-classes). The `package.json` has a reference to the `index.ts` file by export: `/react`.

```tsx
import { Button } from "@pap-it/button/react";

function Component() {
  return (
    <Button>Hello World</Button>
  )
}
```

##### views

The views folder as mentioned earlier stems from SSR related structures and incorporates basic viewing of our package. It contains some preset folders but they all follow they same (which follows very basic html file structure) and needs no major explenation, main.js includes our package and we usually see references to some documentation helper web-components `doc-card`, `pap-codeblock`.

```bash
views/
  sub-folder/
    index.html
    style.css
    main.js
```

The server inside the root/scripts folder when runned with `npm start sub-folder` would lookup if this sub-folder of views contains `index.html` and renders it. It deals with bundelling `*.js` files (esbuild) which makes sure we can run our code.

##### src

The `src` folder consists of a basic structure like:

```bash
components/
  sub-component/
    style.scss
    index.ts
component.ts
register.ts
index.ts
types.ts
style.scss
```

From this we might see more files that has been generated like the `style.ts` file but clearly it comes from the SASS file.

The `component` file is the logic code file we would see our component code exists inside. Here is basically the component code, we use SASS as mentioned to have all style code and types to help us seperate logic and models. The `components/**/index.ts` file is the eqvivalent corresponding logic code file for any sub-components.

The `register.ts` file is used to register all web-components using the custom-elements method exposed by the browser. This would include main + all sub components. A reference to this file exists as a exports inside the `package.json` of the package itself under the url: `/wc` and this is how you would import the web-component itself.

```html
<script>
  import "@pap-it/button/wc";
  
  // now I can use it inside html
</script>

<pap-button>Hello World</pap-button>
```

The `index.ts` file found directly in `src` exposes our components, sub-components and the types.ts file and a reference inside the `package.json` of this package exists aswell under the `.` format. It basically deals with exposing all classes and types.

```javascript
import { Button, Variant } from "@pap-it/button";

// Button is a class
// Variant is a type
```

### Scripts (Global)

To find more details please follow the link: [details](/scripts/README.md)

The overall general scripts is the following:

- analyse
- component
- generator
- react
- publish
- server
- theme

**note** this is just a generic outline and much has been left out.

These scripts (defined inside in the folder) serves as our 0-dependency library. Basically they do what you would normally have libraries to do for you. This because with evergoing changes that breaks functionalities we cannot trust having packages - unless we want to make our life more misserable with ever going changes and threats.

(overall they only deal with dev related tools and does not affect our component code).

## How to use (general scope)

The aim of this section is to bring you a generic vision in how to use this ecosystem.  

### How to create new component

run `npm run create` inside the root folder, this would (funny enough) call the `generate` global script which would give you a set of question (type and name) and would then generate you a template code structure to the destination based on type.

### How to run a component (start)

by `cd` into the package we can use `npm start` to start the dev-server and view our demo case.

## Build/Publish

### How to build all components

### How to publish
