// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";

export class Colors extends CustomElement {
  static style = style;
  @property() mode: "light" | "dark" = "light";
  @property({ type: Array }) colors: string[] = ["primary", "secondary", "tertiary", "error", "success", "warning", "information"];

  render() {
    return html`
      <h1>Color ${this.mode}</h1>
      <p>Here you have a longer paragraph text to illustrate how normal text looks on default foreground color</p>

      <h2>Backgrounds</h2>
      <div class="boxes">
        <div class="background">
          <h4>--background</h4>
          <p>Here's some text to illustrate how text looks on default background</p>
        </div>
        <div class="background-1">
          <h4>--background-1</h4>
          <p>Here's some text to illustrate how text looks on background level 1</p>
        </div>
        <div class="background-2">
          <h4>--background-2</h4>
          <p>Here's some text to illustrate how text looks on background level 2</p>
        </div>
        <div class="background-3">
          <h4>--background-3</h4>
          <p>Here's some text to illustrate how text looks on background level 3</p>
        </div>
      </div>

      <h2>Foregrounds</h2>
      <div class="boxes">
        <div class="foreground">
          <h4>--foreground</h4>
          <p>Here's some text to illustrate how text looks on default foreground</p>
        </div>
        <div class="foreground-1">
          <h4>--foreground-1</h4>
          <p>Here's some text to illustrate how text looks on foreground level 1</p>
        </div>
        <div class="foreground-2">
          <h4>--foreground-2</h4>
          <p>Here's some text to illustrate how text looks on foreground level 2</p>
        </div>
        <div class="foreground-3">
          <h4>--foreground-3</h4>
          <p>Here's some text to illustrate how text looks on foreground level 3</p>
        </div>
      </div>

      <h2>Shadows</h2>
      <div class="shadows">
        <span data-shadow="default">pap-shadow</span>
        <span data-shadow="1">pap-shadow-1</span>
        <span data-shadow="2">pap-shadow-2</span>
        <span data-shadow="3">pap-shadow-3</span>
      </div>

      <h2>Borders</h2>
      <div class="borders">
        <span data-border="default">pap-border</span>
        <span data-border="1">pap-border-1</span>
        <span data-border="2">pap-border-2</span>
        <span data-border="3">pap-border-3</span>
      </div>

      <h2>Colors</h2>
      <div class="cards">
        ${this.colors.map(color => html`
          <showcase-color-card key="${color}" variable="${color}"></showcase-color-card>
        `)}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-colors": Colors;
  }
}