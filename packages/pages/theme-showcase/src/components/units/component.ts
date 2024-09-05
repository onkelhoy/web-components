// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";

export class Units extends CustomElement {
  static style = style;

  render() {
    return html`
      <h1>Units</h1>

      <div class="flex large space-between wrap">
        <div>
          <h2>Radius</h2>
          <div class="radiuses">
            <span data-radius="small">radius-small</span>
            <span data-radius="medium">radius-medium</span>
            <span data-radius="large">radius-large</span>
          </div>
        </div>

        <div>
          <h2>Margins</h2>
          <div class="margins">
            <span data-margin="small"><span>margin-small</span></span>
            <span data-margin="medium"><span>margin-medium</span></span>
            <span data-margin="large"><span>margin-large</span></span>
          </div>
        </div>

        <div>
          <h2>Paddings</h2>
          <div class="paddings">
            <span data-padding="small"><span>padding-small</span></span>
            <span data-padding="medium"><span>padding-medium</span></span>
            <span data-padding="large"><span>padding-large</span></span>
          </div>
        </div>
      </div>

      <hr />

      <h2>Gaps</h2>
      <div class="gaps flex large space-between wrap">
        <div data-gap="small">
          <p>--gap-small</p>
          <div>
            <span class="small"></span>
            <span class="small"></span>
            <span class="small"></span>
          </div>
        </div>
        <div data-gap="medium">
          <p>--gap-medium</p>
          <div>
            <span class="small"></span>
            <span class="small"></span>
            <span class="small"></span>
          </div>
        </div>
        <div data-gap="large">
          <p>--gap-large</p>
          <div>
            <span class="small"></span>
            <span class="small"></span>
            <span class="small"></span>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-units": Units;
  }
}