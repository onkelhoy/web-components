// import statements 
// system 
import { CustomElement, html, property } from "@papit/web";

// local 
import { style } from "./style";
import { ClickEvent } from "./types";

export class TEMPLATE_CLASS_NAME extends CustomElement {
  static style = style;

  // properties 
  @property({ type: Boolean }) foo: boolean = false;

  // event handlers
  private handleclick = () => {
    this.dispatchEvent(new CustomEvent<ClickEvent>("main-click", { detail: { timestamp: performance.now() } }));
  }

  render() {
    return html`
      <p @click="${this.handleclick}">Llama Trauma Baby Mama</p>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "TEMPLATE_HTML_NAME": TEMPLATE_CLASS_NAME;
  }
}