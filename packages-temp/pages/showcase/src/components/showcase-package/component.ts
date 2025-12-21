// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";

export class ShowcasePackage extends CustomElement {
  static style = style;

  render() {
    return html`
      <pap-tabs>
        
      </pap-tabs>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-showcase-package": ShowcasePackage;
  }
}