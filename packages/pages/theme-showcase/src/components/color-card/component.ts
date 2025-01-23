// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";

export class ColorCard extends CustomElement {
  static style = style;

  @property({
    set: function (this: ColorCard, value: string) {
      if (!value.startsWith("--")) {
        return "--pap-" + value;
      }
      return value;
    }
  }) variable: string = "--pap-primary";

  render() {
    console.log('render', this.variable);
    return html`
      <style>
        :host {
          color: var(${this.variable});

          & span {
            background: var(${this.variable});
          }

          & p.text {
            color: var(${this.variable}-text);
          }

          & p.contrast {
            background: var(${this.variable});
            color: var(${this.variable}-contrast);
          }
        }
      </style>
      <span class="color"></span>
      <p class="text">${this.variable}</p>
      <p class="contrast">Contrast Text</p>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-color-card": ColorCard;
  }
}