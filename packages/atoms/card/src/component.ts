// import statements 
// system 
import { bind, CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";

export class Card extends CustomElement {
  static style = style;

  @property({ removeAttribute: true }) radius: "small" | "medium" | "large" | undefined = "medium";
  @property({ type: Boolean, attribute: false, rerender: true }) headerNodes = false;

  @bind
  private handleslotchange(e: Event) {
    if (!(e.target instanceof HTMLSlotElement)) return;
    this.headerNodes = e.target.assignedNodes().some(node => {
      if (node instanceof Element) return true;
      return node.textContent?.trim();
    });
  }

  render() {
    return html`
      <header part="header" class="${this.headerNodes && "has-nodes"}">
        <slot @slotchange=${this.handleslotchange} name="header"></slot>
      </header>
      <main>
        <slot></slot>
      </main>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-card": Card;
  }
}