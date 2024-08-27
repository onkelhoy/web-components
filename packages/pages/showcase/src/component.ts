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
      <section>
        ${this.data.forEach(layer => html`
          <div key="${layer.name}">
            <p>${layer.name}</p>
            ${layer.packages.forEach(pkg => html`<a key="${pkg.location}" href="${pkg.location}">${pkg.name}</a>`)}
          </div>
        `)}
      </section>
      <main>
        <pap-router hash-based="${this.hashbased}" url="${this.url}" update-url="true">
          ${this.data.forEach(layer => {
      return layer.packages.forEach(pkg => html`
              <pap-route 
                key="${layer.name}/${pkg.name}"
                path="${layer.name}/${pkg.name}" 
                realpath="${pkg.location}/views/showcase" 
                fallback="${pkg.location}/views/${pkg.name}"
              ></pap-route>
            `)
    })}
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