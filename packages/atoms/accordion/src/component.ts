// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";
import { Mode } from "./types";

export class Accordion extends CustomElement {
  static style = style;

  @property({ rerender: false, type: Boolean }) open: boolean = false;
  @property({ rerender: false }) mode: Mode = "vertical";

  render() {
    return `
      <div part="group">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-accordion": Accordion;
  }
}