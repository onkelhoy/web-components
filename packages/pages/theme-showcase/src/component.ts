// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";
// import "@papit/markdown";

// local 
import { style } from "./style";

export class PageThemeShowcase extends CustomElement {
  static style = style;

  render() {
    return html`
      <div class="grid">
        <section class="intro">
          <pap-markdown>
            <slot></slot>
          </pap-markdown>
        </section>
        <section class="animations">
          <showcase-animations>
            <slot name="animations"></slot>
          </showcase-animations>
        </section>
        <section class="units">
          <showcase-units>
            <slot name="units"></slot>
          </showcase-units>
        </section>
        <section class="left">
          <showcase-colors>
            <slot name="color-main"></slot>
          </showcase-colors>
        </section>
        <section part="theme-opposite" class="right">
          <showcase-colors>
            <slot name="color-opposite"></slot>
          </showcase-colors>
        </section>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "theme-showcase": PageThemeShowcase;
  }
}