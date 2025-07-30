// utils 
import { CustomElement } from "@papit/core";

// local 
import { style } from "./style";

export class TabsContent extends CustomElement {
  static style = style;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('slot', 'content');
  }

  public init(parent: HTMLElement) {
    parent.addEventListener('change', this.handlechange);
  }

  // event handlers
  private handlechange = (e: Event) => {
    // NOTE change can be bubbled so a input inside (slotted) would trigger -> make sure currentTarget & target is same meaning its tabs 
    if (e.target && e.currentTarget === e.target) {
      if ('selected' in e.target) {
        if (this.checkid('id', e.target.selected as string)) return;
      }

      if ('selected_id' in e.target) {
        if (this.checkid('data-tab-id', e.target.selected_id as string)) return;
      }

      this.classList.remove("selected");
    }
  }

  // helper function 
  private checkid(ref: string, target: string) {
    const id = this.getAttribute(ref);
    if (id === target) {
      this.classList.add("selected");
      return true;
    }
  }

  render() {
    return '<slot></slot>'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-tabs-content": TabsContent;
  }
}