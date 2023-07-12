// utils 
import { html, property, query } from "@circular-tools/utils";
import "@circular-tools/translator/wc";

// atoms 
import { Menu } from '@circular/menu';
import "@circular/menu/wc";
import "@circular/typography/wc";

// templates
import { BaseTemplate } from "@circular-templates/base";

import { style } from "./style";

export class Theme extends BaseTemplate {
  static style = style;

  @query('o-menu') menuElement!: Menu;

  // event handlers 
  private handlenewtheme = () => {

  }
  private handlethemechange = () => {

  }
  private handleselect = (e:Event) => {
    if (e.target instanceof Menu)
    {
      // window.oTheme.change(e.target.value);
    }
  }

  render() {
    return html`
      <o-menu placement="bottom-left" @select="${this.handleselect}">
        <span slot="button-prefix" class="theme-color"></span>
        <o-typography slot="button" class="theme-name"><o-translator>Missing</o-translator></o-typography>
      </o-menu>
    `
  }
}