// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";
// logicals
import "@papit/router";

// local 
import { style } from "./style";
import { Layer } from "./types";

export class PageShowcase extends CustomElement {
  static style = style;

  // properties 
  @property({ type: Array }) data: Layer[] = [];
  @property({ type: Boolean, attribute: 'hash-based' }) hashbased: boolean = true;
  @property() url!: string;

  render() {
    return html`
      <section>menu</section>
      <main>
        <pap-router hash-based="${this.hashbased}" url="${this.url}" update-url="true">
          ${this.data.forEach(layer => console.log('layer', layer))}
        </pap-router>
      </main>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-showcase": PageShowcase;
  }
}