// import statements 
// system 
import { html, property, bind } from "@papit/core";

import { BinaryFormElement } from "@papit/binary-form-element";

// local 
import { Color, Radius, Size } from "./types";
import { style } from "./style";


// TODO: inside the file "packages/system/core/src/class/element"
export class Switch extends BinaryFormElement {
  static style = style;

  @property color: Color = "success";
  @property size: Size = "medium";
  @property radius: Radius = "circle";

  @bind
  private handleslotchange(e: Event) {
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
        <p part="label"><slot @slotchange="${this.handleslotchange}"></slot></p>
        <p part="description" variant="p2"><slot @slotchange="${this.handleslotchange}" name="description"></slot></p>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-switch": Switch;
  }
}