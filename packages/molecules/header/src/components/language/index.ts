// utils 
import { html, property, query } from "@circular-tools/utils";
import { TRANSLATION_ADDED, TRANSLATION_CHANGE_EVENTNAME, InitTranslations } from "@circular-tools/translator";
import "@circular-tools/translator/wc";

// atoms
import "@circular/menu/wc";
import { Menu, MenuItem } from "@circular/menu";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local imports
import { style } from "./style";
import LanguageEmojis from './languages.json';

export class Language extends BaseTemplate {
  static style = style;

  @query('span.display') displayElement!: HTMLSpanElement;
  @query('o-menu') menuElement!: Menu;
  @query('template') templateElement!: HTMLTemplateElement;

  constructor() {
    super();
    InitTranslations();
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(TRANSLATION_ADDED, this.handlenewlanguage);
    window.addEventListener(TRANSLATION_CHANGE_EVENTNAME, this.handlelanguagechange);

    if (window.oTranslation?.map?.size > 0)
    {
      this.handlenewlanguage();
    }
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(TRANSLATION_ADDED, this.handlenewlanguage);
  }

  // event handlers 
  private handlenewlanguage = () => {
    if (window.oTranslation)
    {
      const currentLanguages = this.menuElement.querySelectorAll<MenuItem>("o-menu-item");
      const languages = Array.from(window.oTranslation.map);
      const exists = new Set();
  
      currentLanguages.forEach(item => {
        const v = item.value;
        if (!window.oTranslation.map.has(v))
        {
          this.menuElement.removeChild(item);
        }
        else 
        {
          exists.add(v);
        }
      })
  
      languages.forEach(([id, set]) => {
        if (!exists.has(id))
        {
          const newitem = this.templateElement.content.cloneNode(true) as HTMLElement;
        
          const itemElement = newitem.querySelector<MenuItem>('o-menu-item');
          if (itemElement) 
          {
            itemElement.setAttribute('value', set.id);
          }
  
          const translatorElement = newitem.querySelector("o-translator");
          if (translatorElement) translatorElement.innerHTML = set.name
  
          const spanElement = newitem.querySelector("span.flag > span");
          if (spanElement) spanElement.innerHTML = (LanguageEmojis as any)[set.name]
  
          this.menuElement.appendChild(newitem);
        }
      })
    }
  }
  private handlelanguagechange = () => {
    if (this.menuElement && window.oTranslation?.current)
    {
      if (this.displayElement) this.displayElement.innerHTML = (LanguageEmojis as any)[window.oTranslation.current.name]
      if (this.menuElement.value !== window.oTranslation.current.id)
      {
        this.menuElement.value = window.oTranslation.current.id;
      }
    }
  }
  private handlelanguageselect = (e:Event) => {
    if (e.target instanceof Menu && this.displayElement)
    {
      if (e.target.value !== "init") window.oTranslation.change(e.target.value);
    }
  }

  render() {
    return html`
      <template>
        <o-menu-item>
          <div class="grid">
            <span class="wrapper">
              <span class="flag">
                <span></span>
              </span>
            </span>
            <o-typography><o-translator></o-translator></o-typography>
          </div>
        </o-menu-item>
      </template>

      <o-menu placement="bottom-right" @select="${this.handlelanguageselect}">
        <span slot="button-prefix" class="wrapper">
          <span class="flag">
            <span class="display">-</span>
          </span>
        </span>
        <o-menu-item value="init"><o-translator>No Languages Available</o-translator></o-menu-item>
      </o-menu>
    `
  }
}