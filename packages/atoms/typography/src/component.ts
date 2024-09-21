// import statements 
// system 
import { CustomElement, property } from "@papit/core";

// local 
import { style } from "./style";
import { Variant, Alignment, Weight } from "./types";

export class Typography extends CustomElement {
  static style = style;

  @property({ rerender: false }) variant: Variant = "p";
  @property({ rerender: false }) weight: Weight = "normal";
  @property({ rerender: false }) align: Alignment = "initial";
  @property({ rerender: false, type: Boolean }) nowrap: boolean = false;
  @property({ rerender: false, type: Boolean }) truncate: boolean = false;

  render() {
    return `<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-typography": Typography;
  }
}