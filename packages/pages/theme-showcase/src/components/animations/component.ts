// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";

export class Animations extends CustomElement {
  static style = style;

  private handleplay = (e: Event) => {
    if (e.target instanceof HTMLElement) {
      const parent = e.target.parentElement;
      if (parent) {
        parent.classList.toggle("play");
      }
    }
  }

  render() {
    return html`
      <h1>Animations</h1>
      <p>Here is a showcase to illustrate animation-timings using simple linear animation</p>

      <div data-speed="slow">
        <p>--timing-slow</p>
        <div>
          <span></span>
        </div>
        <button @click="${this.handleplay}">play</button>
      </div>

      <div data-speed="normal">
        <p>--timing-normal</p>
        <div>
          <span></span>
        </div>
        <button @click="${this.handleplay}">play</button>
      </div>

      <div data-speed="fast">
        <p>--timing-fast</p>
        <div>
          <span></span>
        </div>
        <button @click="${this.handleplay}">play</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-animations": Animations;
  }
}