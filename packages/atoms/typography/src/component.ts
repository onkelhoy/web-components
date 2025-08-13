// import statements 
// system 
import { CustomElement, property } from "@papit/core";

// local 
import { style } from "./style";
import { Variant, Alignment, Weight } from "./types";

export class Typography extends CustomElement {
  static style = style;

  @property variant: Variant = "p";
  @property weight: Weight = "normal";
  @property align: Alignment = "initial";
  @property({ type: Boolean }) nowrap: boolean = false;
  @property({ type: Boolean }) truncate: boolean = false;

  render() {
    return `<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-typography": Typography;
  }
}