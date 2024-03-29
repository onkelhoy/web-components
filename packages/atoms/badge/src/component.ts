// utils 
import { html, property, FormatNumber, Size, CustomElement } from "@pap-it/system-utils";

// atoms
import "@pap-it/typography/wc"

// templates
import "@pap-it/templates-box/wc"

// local 
import { style } from './style';

export class Badge extends CustomElement {
  static style = style;

  @property({ type: Number }) count: number = 0;
  @property({ rerender: false }) size: Size = "medium";

  render() {
    return html`
      <pap-box-template part="box" radius="circular">
        <pap-typography variant="C4"><slot>${FormatNumber(this.count)}</slot></pap-typography>
      </pap-box-template>
    `
  }
}


declare global {
  interface HTMLElementTagNameMap {
    "pap-badge": Badge;
  }
}