// utils 
import { ExtractSlotValue, CustomElement, html, property } from "@papit/core";

// local 
import { style } from "./style";
import { Localization, TranslateSettings } from "./components/localization";

export class Translator extends CustomElement {
  static style = style;

  public localization: Localization;
  public dynamicAttributes: Set<string> = new Set<string>();

  private internal = false;
  private noupdate = false;
  private observer: MutationObserver;

  private text!: string;
  private _key!: string;
  get key() {
    return this._key;
  }
  set key(value: string) {
    if (typeof value === 'string') {
      this._key = value;
      // this._key = value.replace(/<!--\?lit.*?>(.*)/, '$1');
    }
    else {
      this._key = '';
    }

    this.updateText();
  }

  public t(key: string, settings?: Partial<TranslateSettings>) {
    return this.localization.t(key, settings);
  }

  public get innerText() {
    return this.text;
  }
  public get innerHTML() {
    return this.text;
  }
  public get textContent() {
    return this.text;
  }

  @property({
    rerender: false,
    after: function (this: Translator) {
      this.updateText();
    }
  }) scope?: string;

  constructor() {
    super();

    this.localization = new Localization();
    this.observer = new MutationObserver(this.mutantobservercallback);
    this.observer.observe(this, {
      attributes: true,
    });
  }

  // class functions 
  connectedCallback(): void {
    super.connectedCallback();
    window.localization.subscribe(this.updateText);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.localization.unsubscribe(this.updateText);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (this.dynamicAttributes.has(name)) {
      this.updateText();
    }
  }

  // event handlers 
  private mutantobservercallback: MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => {
    if (this.internal) {
      this.internal = false;
      return;
    }
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName) {
        if (this.dynamicAttributes.has(mutation.attributeName)) {
          this.internal = true;
          this.updateText();
        }
      }
    }
  }
  private handleslotchange = (e: Event) => {
    if (e.target instanceof HTMLSlotElement) {
      const text = ExtractSlotValue(e.target).join(' ').trim();
      this.key = text;
    }
  }

  // public functions 
  public translateKey(key: string, variables?: Record<string, string>) {
    if (variables) {
      for (let name in variables) {
        this.setAttribute(name, variables[name]);
        this.dynamicAttributes.add(name);
      }
    }

    if (this.key !== key) {
      this.noupdate = true;
      this.key = key;
    }

    return this.text;
  }

  // private functions 
  private updateText = () => {
    const text = this.localization.translate(this.key, {
      element: this,
      scope: this.scope
    });
    if (!text) return;

    this.text = text;

    if (!this.noupdate) {
      this.requestUpdate();
    }

    this.internal = false;
    this.noupdate = false;
  };

  render() {
    return html`
      <span>${this.text}</span>
      <slot hidden style="display:none" @slotchange="${this.handleslotchange}"></slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-translator": Translator;
  }
}