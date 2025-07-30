// import statements 
// system 
import { CustomElement, html, property, query } from "@papit/core";

// atoms 
import "@papit/typography";
import "@papit/button";

// logicals
import "@papit/router";

// local 
import { style } from "./style";
import { Layer } from "./types";
import { Router } from "@papit/router";

export class PageShowcase extends CustomElement {
  static style = style;

  // properties 
  @property({ type: Array }) data: Layer[] = [];
  @property({ type: Boolean, attribute: 'hash-based' }) hashbased: boolean = true;
  @property({ attribute: 'base-url' }) baseurl: string = "../../..";

  @query<Router>('pap-router') router!: Router;

  // event handle
  private handlepackageclick = (e: Event) => {
    if (this.router) {
      this.router.url = (e.target as HTMLButtonElement).getAttribute("data-url") as string;
    }
    else {
      console.error("[chill] you clicked before router was initialized!");
    }
  }

  // private helpers
  private menu() {
    return this.data.map(layer => html`
      <div key="${layer.name}">
        <pap-typography>${layer.displayname || layer.name}</pap-typography>
        ${layer.packages.map(pkg => {
      let name, displayname;
      if (typeof pkg === "object") {
        name = pkg.name;
        displayname = pkg.displayname || name;
      }
      else {
        name = pkg;
        displayname = name;
      }

      return html`
          <pap-button 
            variant="clear"
            radius="small" 
            size="small" 
            key="${layer.name}/${name}" 
            data-url="${layer.name}/${name}"
            class="content-flex-start"
            @click="${this.handlepackageclick}" 
          >
            ${displayname}
          </pap-button>
        `;
    })}
      </div>
    `)
  }

  render() {

    return html`
      <section>
        <slot name="menu-above"></slot>
        ${this.menu()}
        <slot name="menu-below"></slot>
      </section>
      <main>
        <slot name="main-top"></slot>
        <pap-router hash-based="${this.hashbased}" update-url="true">
          <span url=":type/:package" reroute="/packages/:type/:package/views/:view" view="showcase" view-fallback=":package" />
        </pap-router>
        <slot name="main-bottom"></slot>
      </main>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-showcase": PageShowcase;
  }
}