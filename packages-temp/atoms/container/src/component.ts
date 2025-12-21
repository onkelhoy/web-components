// import statements 
// system 
import { CustomElement, html } from "@papit/core";

// local 
import { style } from "./style";

export class Container extends CustomElement {
  static style = style;


  render() {
    return html`
      <slot></slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-container": Container;
  }
}