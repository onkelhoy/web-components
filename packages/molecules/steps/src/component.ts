// system
import { html, property, CustomElement } from "@pap-it/system-utils";

// atoms
import "@pap-it/typography/wc";

// templates
import "@pap-it/templates-box/wc";

// local 
import { style } from "./style";

export class Steps extends CustomElement {
  static style = style;

  @property({ type: Array }) steps: string[] = [];

  @property({ type: Number }) current = 0;

  render() {
    return html`
      <pap-box-template radius="medium">
        ${this.steps.map((step, index) => {
      let status = "incomplete";
      if (this.current === index) status = 'active';
      else if (this.current > index) status = "complete";
      return html`  
              <div class="step ${this.current > index ? 'selected' : ''}">
                <pap-typography align="center">${step}</pap-typography>
                <div>
                  <pap-circle status="${status}"></pap-circle>
                  <span></span>
                </div>
              </div>
            `
    })}
      </pap-box-template>
    `
  }
}


declare global {
  interface HTMLElementTagNameMap {
    "pap-steps": Steps;
  }
}