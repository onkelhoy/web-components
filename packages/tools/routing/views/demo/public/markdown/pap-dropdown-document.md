# Dropdown

Atomic Type: atoms

Version: 1.0.0

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
import { html, property, query, debounce } from "@pap-it/system-utils";

// atoms
import '@pap-it/icon/wc';

// templates
import { TextinputTemplate } from '@pap-it/templates-textinput';
import { Placement, Popover } from "@pap-it/templates-popover";
import '@pap-it/templates-popover/wc';
import '@pap-it/templates-box/wc';

// local
import { style } from "./style";
import { IOption, OptionType } from "./types";
import { Option } from "./components/option";

export class Dropdown extends TextinputTemplate<HTMLInputElement> {
  static style = style;

  @property({ rerender: false, type: Boolean }) multiple: boolean = false;
  @property() placement: Placement = "bottom-left";
  @property({ type: Boolean }) search: boolean = false;
  @property({ type: Array, rerender: false, onUpdate: "onoptionupdate" }) options?: Array<OptionType>;
  // @property({ type: Array, rerender: false, attribute: false }) values: string[] = [];
  @property({ rerender: false, type: Boolean }) popoveropen: boolean = false;
  @query('pap-popover-template') popoverElement!: Popover;

  // NOTE when we need values to be preselected... its gonna be a pain
  private __options: IOption[] = [];

  public get values() {
    return this.value.split(',').map(v => v.trim());
  };
  public set values(values: string[]) {
    this.value = values.join(',');

    const texts = new Array<string>();
    values.forEach(v => {
      const option = this.__options.find(o => o.value === v);
      if (option) {
        texts.push(option.text);
      }
    })

    const text = texts.join(', ');

    if (text.length > 25 && texts.length > 1) {
      this.inputElement.value = `${texts.length} items selected`;
    }
    else {
      this.inputElement.value = text;
    }
  };

  constructor() {
    super();

    this.debouncedCheckValue = debounce(this.checkValue, 100);
    this._suffix = '<pap-icon customsize="13" name="caret">^</pap-icon>'
  }
  // private functions
  private debouncedCheckValue() { }
  private checkValue = () => {
    if (this.value && this.values.length === 0) {
      this.values = this.value.split(',').map(v => v.trim());
    }

    let newvalues = [...this.values];
    for (let i = 0; i < newvalues.length; i++) {
      if (!this.__options.find(o => newvalues[i] === o.value)) {
        newvalues.splice(i, 1);
        i--;
      }
    }

    this.values = newvalues;
  }

  // public functions
  public registerOption(element: Option) {
    if (!element.hasAttribute('data-dropdown-option')) {
      element.setAttribute('data-dropdown-option', 'true');
      element.addEventListener('click', this.handleoptionclick);
      element.addEventListener('registered', this.handleoptionregister);
      this.__options.push({ text: element.getText(), value: element.getValue() })
      this.debouncedCheckValue();
    }
  }

  // on updates
  private onoptionupdate = () => {
    if (this.options) {
      this.__options = this.options.map(value => {
        if (typeof value === "number") return { text: value.toString(), value: value.toString() }
        if (typeof value === "boolean") return { text: value.toString(), value: value.toString() }
        if (typeof value === "string") return { text: value, value }
        return value;
      });

      this.debouncedRequestUpdate();
    }
  }

  // event handlers
  override handlefocus = () => {
    this.hasFocus = true;
    if (!this.popoverElement.open) this.popoverElement.show();
  }
  private handleoptionregister = (e: Event) => {
    if (e.target instanceof Option) {
      this.__options.push({ text: e.target.getText(), value: e.target.getValue() })
    }
  }
  private handleoptionclick = (e: Event) => {
    if (e instanceof CustomEvent) {
      let values = this.values;
      const index = values.findIndex(v => v === e.detail.value);
      if (index >= 0) {
        values.splice(index, 1);
      }
      else {
        if (!this.multiple) {
          // always clear it
          values = [];
        }
        values.push(e.detail.value);
      }

      this.values = values;
    }
  }
  private handleShow = () => {
    this.popoveropen = true;
  }
  private handleHide = () => {
    this.popoveropen = false;
  }

  render() {
    const superrender = super.render(html`
            <input
                @click="${this.handlekeyup}"
                @keyup="${this.handlekeyup}"
                data-tagname="select"
                ${!this.search ? "readonly='true'" : ""}
                placeholder="${this.placeholder || ""}"
                value="${this.value || ""}"
            />
        `)

    return html`
            <pap-popover-template @show="${this.handleShow}" @hide="${this.handleHide}" revealby="click">
                <span slot="target">
                    ${superrender}
                </span>
                <pap-box-template class="options" radius="small" elevation="small">
                    
                    <slot>
                        ${this.__options.map(v => html`<pap-option key="${v.value}" value="${v.value}">${v.text}</pap-option>`)}
                        ${this.__options?.length === 0 ? '<pap-option key="missing-value">Missing Options</pap-option>' : ''}
                    </slot>
                </pap-box-template>
            </pap-popover-template>
        `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-dropdown": Dropdown;
  }
}

## REGISTER-CODE

import { Dropdown } from './component.js';
import { Option } from './components/option';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('pap-dropdown')) {
  cElements.define('pap-dropdown', Dropdown);
}
if (!cElements.get('pap-option')) {
  cElements.define('pap-option', Option);
}
PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and the types can you give me the following tables.

1. properties (columns: name, default-value, type, description)
2. events (columns: name - ex: 'click', type - ex: CustomEvent<ClickEvent>, description - when its being triggered etc)
3.public functions (columns: name, arguments - ex: arg1:CustomType, arg2?: boolean = true, arg3?: string, description - breif explenation what it does)

## SOURCE-CODE

 // utils
import { html, property, query, debounce } from "@pap-it/system-utils";

// atoms
import '@pap-it/icon/wc';

// templates
import { TextinputTemplate } from '@pap-it/templates-textinput';
import { Placement, Popover } from "@pap-it/templates-popover";
import '@pap-it/templates-popover/wc';
import '@pap-it/templates-box/wc';

// local
import { style } from "./style";
import { IOption, OptionType } from "./types";
import { Option } from "./components/option";

export class Dropdown extends TextinputTemplate<HTMLInputElement> {
  static style = style;

  @property({ rerender: false, type: Boolean }) multiple: boolean = false;
  @property() placement: Placement = "bottom-left";
  @property({ type: Boolean }) search: boolean = false;
  @property({ type: Array, rerender: false, onUpdate: "onoptionupdate" }) options?: Array<OptionType>;
  // @property({ type: Array, rerender: false, attribute: false }) values: string[] = [];
  @property({ rerender: false, type: Boolean }) popoveropen: boolean = false;
  @query('pap-popover-template') popoverElement!: Popover;

  // NOTE when we need values to be preselected... its gonna be a pain
  private __options: IOption[] = [];

  public get values() {
    return this.value.split(',').map(v => v.trim());
  };
  public set values(values: string[]) {
    this.value = values.join(',');

    const texts = new Array<string>();
    values.forEach(v => {
      const option = this.__options.find(o => o.value === v);
      if (option) {
        texts.push(option.text);
      }
    })

    const text = texts.join(', ');

    if (text.length > 25 && texts.length > 1) {
      this.inputElement.value = `${texts.length} items selected`;
    }
    else {
      this.inputElement.value = text;
    }
  };

  constructor() {
    super();

    this.debouncedCheckValue = debounce(this.checkValue, 100);
    this._suffix = '<pap-icon customsize="13" name="caret">^</pap-icon>'
  }
  // private functions
  private debouncedCheckValue() { }
  private checkValue = () => {
    if (this.value && this.values.length === 0) {
      this.values = this.value.split(',').map(v => v.trim());
    }

    let newvalues = [...this.values];
    for (let i = 0; i < newvalues.length; i++) {
      if (!this.__options.find(o => newvalues[i] === o.value)) {
        newvalues.splice(i, 1);
        i--;
      }
    }

    this.values = newvalues;
  }

  // public functions
  public registerOption(element: Option) {
    if (!element.hasAttribute('data-dropdown-option')) {
      element.setAttribute('data-dropdown-option', 'true');
      element.addEventListener('click', this.handleoptionclick);
      element.addEventListener('registered', this.handleoptionregister);
      this.__options.push({ text: element.getText(), value: element.getValue() })
      this.debouncedCheckValue();
    }
  }

  // on updates
  private onoptionupdate = () => {
    if (this.options) {
      this.__options = this.options.map(value => {
        if (typeof value === "number") return { text: value.toString(), value: value.toString() }
        if (typeof value === "boolean") return { text: value.toString(), value: value.toString() }
        if (typeof value === "string") return { text: value, value }
        return value;
      });

      this.debouncedRequestUpdate();
    }
  }

  // event handlers
  override handlefocus = () => {
    this.hasFocus = true;
    if (!this.popoverElement.open) this.popoverElement.show();
  }
  private handleoptionregister = (e: Event) => {
    if (e.target instanceof Option) {
      this.__options.push({ text: e.target.getText(), value: e.target.getValue() })
    }
  }
  private handleoptionclick = (e: Event) => {
    if (e instanceof CustomEvent) {
      let values = this.values;
      const index = values.findIndex(v => v === e.detail.value);
      if (index >= 0) {
        values.splice(index, 1);
      }
      else {
        if (!this.multiple) {
          // always clear it
          values = [];
        }
        values.push(e.detail.value);
      }

      this.values = values;
    }
  }
  private handleShow = () => {
    this.popoveropen = true;
  }
  private handleHide = () => {
    this.popoveropen = false;
  }

  render() {
    const superrender = super.render(html`
            <input
                @click="${this.handlekeyup}"
                @keyup="${this.handlekeyup}"
                data-tagname="select"
                ${!this.search ? "readonly='true'" : ""}
                placeholder="${this.placeholder || ""}"
                value="${this.value || ""}"
            />
        `)

    return html`
            <pap-popover-template @show="${this.handleShow}" @hide="${this.handleHide}" revealby="click">
                <span slot="target">
                    ${superrender}
                </span>
                <pap-box-template class="options" radius="small" elevation="small">
                    
                    <slot>
                        ${this.__options.map(v => html`<pap-option key="${v.value}" value="${v.value}">${v.text}</pap-option>`)}
                        ${this.__options?.length === 0 ? '<pap-option key="missing-value">Missing Options</pap-option>' : ''}
                    </slot>
                </pap-box-template>
            </pap-popover-template>
        `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-dropdown": Dropdown;
  }
}

## TYPE-CODE: export type IOption = {

  text: string;
  value: string;
}
export type Primarytype = string | number | boolean;
export type OptionType = Primarytype | IOption;PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and style code probided. Can you create a documentation that includes titles, short descrition and the table for each tables: css-variables, parts, slots.
css-variables should be a table with columns: (name, default-value, type - ex. CSS unit, description).
parts should include all elements that have been exposed with the part attribute ex: <p part='foo'> - and the table should then include columns: (name, description (short)).
slots should include columns: (name, default-value, description)

## SOURCE-CODE

// utils
import { html, property, query, debounce } from "@pap-it/system-utils";

// atoms
import '@pap-it/icon/wc';

// templates
import { TextinputTemplate } from '@pap-it/templates-textinput';
import { Placement, Popover } from "@pap-it/templates-popover";
import '@pap-it/templates-popover/wc';
import '@pap-it/templates-box/wc';

// local
import { style } from "./style";
import { IOption, OptionType } from "./types";
import { Option } from "./components/option";

export class Dropdown extends TextinputTemplate<HTMLInputElement> {
  static style = style;

  @property({ rerender: false, type: Boolean }) multiple: boolean = false;
  @property() placement: Placement = "bottom-left";
  @property({ type: Boolean }) search: boolean = false;
  @property({ type: Array, rerender: false, onUpdate: "onoptionupdate" }) options?: Array<OptionType>;
  // @property({ type: Array, rerender: false, attribute: false }) values: string[] = [];
  @property({ rerender: false, type: Boolean }) popoveropen: boolean = false;
  @query('pap-popover-template') popoverElement!: Popover;

  // NOTE when we need values to be preselected... its gonna be a pain
  private __options: IOption[] = [];

  public get values() {
    return this.value.split(',').map(v => v.trim());
  };
  public set values(values: string[]) {
    this.value = values.join(',');

    const texts = new Array<string>();
    values.forEach(v => {
      const option = this.__options.find(o => o.value === v);
      if (option) {
        texts.push(option.text);
      }
    })

    const text = texts.join(', ');

    if (text.length > 25 && texts.length > 1) {
      this.inputElement.value = `${texts.length} items selected`;
    }
    else {
      this.inputElement.value = text;
    }
  };

  constructor() {
    super();

    this.debouncedCheckValue = debounce(this.checkValue, 100);
    this._suffix = '<pap-icon customsize="13" name="caret">^</pap-icon>'
  }
  // private functions
  private debouncedCheckValue() { }
  private checkValue = () => {
    if (this.value && this.values.length === 0) {
      this.values = this.value.split(',').map(v => v.trim());
    }

    let newvalues = [...this.values];
    for (let i = 0; i < newvalues.length; i++) {
      if (!this.__options.find(o => newvalues[i] === o.value)) {
        newvalues.splice(i, 1);
        i--;
      }
    }

    this.values = newvalues;
  }

  // public functions
  public registerOption(element: Option) {
    if (!element.hasAttribute('data-dropdown-option')) {
      element.setAttribute('data-dropdown-option', 'true');
      element.addEventListener('click', this.handleoptionclick);
      element.addEventListener('registered', this.handleoptionregister);
      this.__options.push({ text: element.getText(), value: element.getValue() })
      this.debouncedCheckValue();
    }
  }

  // on updates
  private onoptionupdate = () => {
    if (this.options) {
      this.__options = this.options.map(value => {
        if (typeof value === "number") return { text: value.toString(), value: value.toString() }
        if (typeof value === "boolean") return { text: value.toString(), value: value.toString() }
        if (typeof value === "string") return { text: value, value }
        return value;
      });

      this.debouncedRequestUpdate();
    }
  }

  // event handlers
  override handlefocus = () => {
    this.hasFocus = true;
    if (!this.popoverElement.open) this.popoverElement.show();
  }
  private handleoptionregister = (e: Event) => {
    if (e.target instanceof Option) {
      this.__options.push({ text: e.target.getText(), value: e.target.getValue() })
    }
  }
  private handleoptionclick = (e: Event) => {
    if (e instanceof CustomEvent) {
      let values = this.values;
      const index = values.findIndex(v => v === e.detail.value);
      if (index >= 0) {
        values.splice(index, 1);
      }
      else {
        if (!this.multiple) {
          // always clear it
          values = [];
        }
        values.push(e.detail.value);
      }

      this.values = values;
    }
  }
  private handleShow = () => {
    this.popoveropen = true;
  }
  private handleHide = () => {
    this.popoveropen = false;
  }

  render() {
    const superrender = super.render(html`
            <input
                @click="${this.handlekeyup}"
                @keyup="${this.handlekeyup}"
                data-tagname="select"
                ${!this.search ? "readonly='true'" : ""}
                placeholder="${this.placeholder || ""}"
                value="${this.value || ""}"
            />
        `)

    return html`
            <pap-popover-template @show="${this.handleShow}" @hide="${this.handleHide}" revealby="click">
                <span slot="target">
                    ${superrender}
                </span>
                <pap-box-template class="options" radius="small" elevation="small">
                    
                    <slot>
                        ${this.__options.map(v => html`<pap-option key="${v.value}" value="${v.value}">${v.text}</pap-option>`)}
                        ${this.__options?.length === 0 ? '<pap-option key="missing-value">Missing Options</pap-option>' : ''}
                    </slot>
                </pap-box-template>
            </pap-popover-template>
        `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-dropdown": Dropdown;
  }
}

## STYLE-CODE

:host {
    --background: var(--dropdown-background-light, var(--pap-color-neutral-50));

    pap-popover-template {
        --popover-gap: var(--gap-small, 8px);
        
        flex-grow: 1;
        width: 100%;
    
        input {
            width: 100%;
        }
    
        &::part(wrapper) {
            width: 100%;
        }
        pap-box-template.options {
            box-sizing: border-box;
            padding: var(--padding-small, 8px);
            width: 100%;
            display: block;
            background-color: var(--background);
            border: 1px solid grey;
    
            max-height: 15rem;
            overflow-y: auto;
        }
    }
}

// for now its only for bottom cases...
$size-map: (
  small: (
    height: var(--field-size-small, 32px),
    blockheight: var(--field-size-small, 32px),
    padding: var(--padding-small, 8px),
  ),
  medium: (
    height: var(--field-size-medium, 40px),
    blockheight: var(--field-size-small, 32px),
    padding: var(--padding-medium, 16px),
  ),
  large: (
    height: var(--field-size-large, 56px),
    blockheight: var(--field-size-small, 32px),
    padding: var(--padding-medium, 16px),
  ),
);

@each $name, $value in $size-map {
    :host([size="#{$name}"]) {
        pap-box-template.wrapper {
            height: var(--pap-field-height-#{$name}, #{map-get($value, height)});
        }
        footer,
        header {
            height: var(--pap-field-block-height-#{$name}, #{map-get($value, blockheight)});
        }
    }
}

@each $name in (small, medium, large) {
    :host([placement="bottom-left"][size="#{$name}"]),
    :host([placement="bottom-center"][size="#{$name}"]),
    :host([placement="bottom-right"][size="#{$name}"]) {
        pap-popover-template::part(wrapper) {
            top: calc(var(--field-size-small, 32px) + var(--field-size-#{$name}));
        }
    }
}

@media (prefers-color-scheme: dark) {
    :host {
        --background: var(--dropdown-background-dark, var(--pap-color-neutral-50)); // NOTE in dark this is black
    }
}

:host([popoveropen="true"]) pap-icon[name="caret"] {
    transform: rotate(180deg);
}
