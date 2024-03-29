// templates
import { PrefixSuffixRender, ItemTemplate } from "@pap-it/templates-menu";

import { style } from "./style";

export class Item extends ItemTemplate {
  static style = style;

  render() {
    const render: PrefixSuffixRender = {
      suffix: `<pap-icon slot="suffix" cache="true" name="check"></pap-icon>`
    };
    // if (this.selected) {
    //   render.suffix = html`<pap-icon slot="suffix" cache="true" name="check"></pap-icon>`
    // }
    // else {
    //   render.suffix = `<span class="icon-spacer" slot="suffix"></span>`
    // }

    return super.render(render);
  }
}