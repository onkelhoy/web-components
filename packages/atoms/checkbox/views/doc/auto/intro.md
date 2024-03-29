PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and register code provided to you - could you create a rather simple introduction text with maybe a code example how to use in html - keep it very simple. Do not give example how to run the register code it's already included (this is for you so you can see the element-tag)! The introduction should be read by developers so it needs not to be simple enough for beginners!

## SOURCE-CODE

// utils
import { html, property } from "@pap-it/system-utils";

// templates
import { Field } from "@pap-it/templates-field";

// local
import { style } from "./style";

export class Checkbox extends Field {
  static style = style;

  @property({ rerender: false, onUpdate: "checkboxColorUpdate" }) color: string = "blue";

  constructor() {
    super();

    this.addEventListener("click", this.handleclick, true);
  }

  // update functions
  private checkboxColorUpdate = () => {
    if (this.inputElement) {
      this.inputElement.style.accentColor = this.color;
    }
  }
  private handleclick = (e: Event) => {
    e.stopPropagation();
    this.checked = !this.checked;
  }

  render() {
    return super.render(html`
            <input readonly type="checkbox" />
        `)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-checkbox": Checkbox;
  }
}

## REGISTER-CODE

import { Checkbox } from './component.js';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('pap-checkbox')) {
  cElements.define('pap-checkbox', Checkbox);
}
