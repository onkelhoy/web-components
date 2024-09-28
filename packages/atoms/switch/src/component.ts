// import statements 
// system 
import { html, property, Color, State, Radius, Size } from "@papit/core";

import "@papit/typography";
import { BinaryFormElement } from "@papit/binary-form-element";

// local 
import { style } from "./style";

export class Switch extends BinaryFormElement {
  static style = style;

  @property({ rerender: false }) color: Color = "success";
  @property({ rerender: false }) size: Size = "medium";
  @property({ rerender: false }) radius: Radius = "circle";
  @property({ rerender: false }) state?: State = undefined;

  private handleslotchange = (e: Event) => {
    if (e.target instanceof HTMLSlotElement) {
      const nodes = e.target.assignedNodes();
      const name = e.target.getAttribute("name") || "label";

      if (nodes.length > 0) {
        this.classList.add(name);
      }
      else {
        this.classList.remove(name);
      }
    }
  }

  render() {
    return html`
      <div part="track">
        <slot name="prefix"></slot>
        <span part="handle"><slot name="handle"></slot></span>
        <slot name="suffix"></slot>
      </div>
      <div part="text">
        <pap-typography part="label"><slot @slotchange="${this.handleslotchange}"></slot></pap-typography>
        <pap-typography part="description" variant="p2"><slot @slotchange="${this.handleslotchange}" name="description"></slot></pap-typography>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-switch": Switch;
  }
}