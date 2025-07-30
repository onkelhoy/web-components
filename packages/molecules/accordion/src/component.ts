// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// atoms 
import "@papit/icon";

// local 
import { style } from "./style";

export class Accordion extends CustomElement {
  static style = style;

  @property({ rerender: false, type: Boolean }) open: boolean = false;

  private handleclick = () => {
    this.open = !this.open;
  }

  render() {
    return html`
      <button @click="${this.handleclick}" part="button">
        <slot name="button"></slot>
        <slot name="icon"><pap-icon part="icon" name="chevron-down" container="small" size="small"></pap-icon></slot>
      </button>
      <div part="wrapper">
        <div part="group">
          <slot></slot>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-accordion": Accordion;
  }
}