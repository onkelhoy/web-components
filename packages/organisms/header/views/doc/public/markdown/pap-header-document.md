# Header

Atomic Type: molecules

Version: 1.0.4

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

PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and register code provided to you - could you create a rather simple introduction text with maybe a code example how to use in html - keep it very simple. Do not give example how to run the register code it's already included (this is for you so you can see the element-tag)! The introduction should be read by developers so it needs not to be simple enough for beginners!

## SOURCE-CODE

// utils
import { html, property, query } from "@pap-it/system-utils";
import "@pap-it/tools-translator/wc";

// atoms
import "@pap-it/badge/wc";
import "@pap-it/typography/wc";
import "@pap-it/menu/wc";
import { Menu } from "@pap-it/menu";

// templates
import { Base } from "@pap-it/system-base";

// local
import { style } from "./style";
import { UserModel } from "./types";

export class Header extends Base {
    static style = style;

    @property({ type: Object }) user?: UserModel;

    // event handlers 
    
    private handleuserselect = (e:Event) => {
        console.log('select user', e)
    }
    // private handlelightnessselect = (e:Event) => {
    //     if (e.target instanceof Menu)
    //     {
    //         this.classList.remove('light-mode', 'dark-mode');
    //         if (e.target.value !== "auto") 
    //         {
    //             this.classList.add(`${e.target.value}-mode`);
    //         }
    //     }
    // }

    render() {
        const avatarlink = this.user?.avatar || `public/images/avatar${Math.round(Math.random() * 4) + 1}.png`
        return html`
            <div class="prefix">
                <slot name="prefix"></slot>
            </div>
            <div class="center">
                <slot></slot>
            </div>
            <div class="suffix">
                <pap-theme></pap-theme>
                <pap-language></pap-language>

                ${this.user ? html`<pap-menu placement="bottom-left" @select="${this.handleuserselect}">
                    <img class="avatar" slot="button-prefix" src="${avatarlink}" alt="${this.user?.firstname || "no-name"} profile picture" />
                    <pap-typography slot="button-content">${this.user?.firstname || "no-name"}</pap-typography>

                    <pap-menu-item value="settings">
                        <pap-typography><pap-translator>User Settings</pap-translator></pap-typography>
                    </pap-menu-item>
                    <pap-menu-item value="logout">
                        <pap-typography><pap-translator>Logout</pap-translator></pap-typography>
                    </pap-menu-item>
                </pap-menu>` : ''}
            </div>
            
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "pap-header": Header;
    }
}

## REGISTER-CODE

import { Theme } from './components/theme';
import { Language } from './components/language';
import { Header } from './component.js';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('pap-header')) {
  cElements.define('pap-header', Header);
}
if (!cElements.get('pap-language')) {
  cElements.define('pap-language', Language);
}
if (!cElements.get('pap-theme')) {
  cElements.define('pap-theme', Theme);
}
PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and the types can you give me the following tables.

1. properties (columns: name, default-value, type, description)
2. events (columns: name - ex: 'click', type - ex: CustomEvent<ClickEvent>, description - when its being triggered etc)
3.public functions (columns: name, arguments - ex: arg1:CustomType, arg2?: boolean = true, arg3?: string, description - breif explenation what it does)

## SOURCE-CODE

 // utils
import { html, property, query } from "@pap-it/system-utils";
import "@pap-it/tools-translator/wc";

// atoms
import "@pap-it/badge/wc";
import "@pap-it/typography/wc";
import "@pap-it/menu/wc";
import { Menu } from "@pap-it/menu";

// templates
import { Base } from "@pap-it/system-base";

// local
import { style } from "./style";
import { UserModel } from "./types";

export class Header extends Base {
    static style = style;

    @property({ type: Object }) user?: UserModel;

    // event handlers 
    
    private handleuserselect = (e:Event) => {
        console.log('select user', e)
    }
    // private handlelightnessselect = (e:Event) => {
    //     if (e.target instanceof Menu)
    //     {
    //         this.classList.remove('light-mode', 'dark-mode');
    //         if (e.target.value !== "auto") 
    //         {
    //             this.classList.add(`${e.target.value}-mode`);
    //         }
    //     }
    // }

    render() {
        const avatarlink = this.user?.avatar || `public/images/avatar${Math.round(Math.random() * 4) + 1}.png`
        return html`
            <div class="prefix">
                <slot name="prefix"></slot>
            </div>
            <div class="center">
                <slot></slot>
            </div>
            <div class="suffix">
                <pap-theme></pap-theme>
                <pap-language></pap-language>

                ${this.user ? html`<pap-menu placement="bottom-left" @select="${this.handleuserselect}">
                    <img class="avatar" slot="button-prefix" src="${avatarlink}" alt="${this.user?.firstname || "no-name"} profile picture" />
                    <pap-typography slot="button-content">${this.user?.firstname || "no-name"}</pap-typography>

                    <pap-menu-item value="settings">
                        <pap-typography><pap-translator>User Settings</pap-translator></pap-typography>
                    </pap-menu-item>
                    <pap-menu-item value="logout">
                        <pap-typography><pap-translator>Logout</pap-translator></pap-typography>
                    </pap-menu-item>
                </pap-menu>` : ''}
            </div>
            
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "pap-header": Header;
    }
}

## TYPE-CODE: export interface UserModel {

  firstname: string;
  lastname: string;
  avatar: string;
}
PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and style code probided. Can you create a documentation that includes titles, short descrition and the table for each tables: css-variables, parts, slots.
css-variables should be a table with columns: (name, default-value, type - ex. CSS unit, description).
parts should include all elements that have been exposed with the part attribute ex: <p part='foo'> - and the table should then include columns: (name, description (short)).
slots should include columns: (name, default-value, description)

## SOURCE-CODE

// utils
import { html, property, query } from "@pap-it/system-utils";
import "@pap-it/tools-translator/wc";

// atoms
import "@pap-it/badge/wc";
import "@pap-it/typography/wc";
import "@pap-it/menu/wc";
import { Menu } from "@pap-it/menu";

// templates
import { Base } from "@pap-it/system-base";

// local
import { style } from "./style";
import { UserModel } from "./types";

export class Header extends Base {
    static style = style;

    @property({ type: Object }) user?: UserModel;

    // event handlers 
    
    private handleuserselect = (e:Event) => {
        console.log('select user', e)
    }
    // private handlelightnessselect = (e:Event) => {
    //     if (e.target instanceof Menu)
    //     {
    //         this.classList.remove('light-mode', 'dark-mode');
    //         if (e.target.value !== "auto") 
    //         {
    //             this.classList.add(`${e.target.value}-mode`);
    //         }
    //     }
    // }

    render() {
        const avatarlink = this.user?.avatar || `public/images/avatar${Math.round(Math.random() * 4) + 1}.png`
        return html`
            <div class="prefix">
                <slot name="prefix"></slot>
            </div>
            <div class="center">
                <slot></slot>
            </div>
            <div class="suffix">
                <pap-theme></pap-theme>
                <pap-language></pap-language>

                ${this.user ? html`<pap-menu placement="bottom-left" @select="${this.handleuserselect}">
                    <img class="avatar" slot="button-prefix" src="${avatarlink}" alt="${this.user?.firstname || "no-name"} profile picture" />
                    <pap-typography slot="button-content">${this.user?.firstname || "no-name"}</pap-typography>

                    <pap-menu-item value="settings">
                        <pap-typography><pap-translator>User Settings</pap-translator></pap-typography>
                    </pap-menu-item>
                    <pap-menu-item value="logout">
                        <pap-typography><pap-translator>Logout</pap-translator></pap-typography>
                    </pap-menu-item>
                </pap-menu>` : ''}
            </div>
            
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "pap-header": Header;
    }
}

## STYLE-CODE

:host,
:host > div {
    display: flex;
    align-items: center;
    gap: 1rem;
}

:host {
    justify-content: space-between;

    pap-menu::part(box) {
        min-width: 15rem;
    }

    div.icon-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--field-size-medium, 40px);
        height: var(--field-size-medium, 40px);
    }
}

img.avatar {
    width: var(--field-size-medium, 40px);
    height: var(--field-size-medium, 40px);
    border-radius: 50%;
}

@media (prefers-color-scheme: light) {
    :host {
        pap-icon[name="dark-mode"] {
            display: none;
        }
    }
}
@media (prefers-color-scheme: dark) {
    :host {
        pap-icon[name="light-mode"] {
            display: none;
        }
    }
}

// overriding
:host(.dark-mode) {
    pap-icon[name="light-mode"] {
        display: none;
    }
    pap-icon[name="dark-mode"] {
        display: initial;
    }
}
:host(.light-mode) {
    pap-icon[name="dark-mode"] {
        display: none;
    }
    pap-icon[name="light-mode"] {
        display: initial;
    }
}
