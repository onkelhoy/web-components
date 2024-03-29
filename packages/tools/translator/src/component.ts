// utils 
import { ExtractSlotValue, CustomElement, html, property } from "@pap-it/system-utils";

// local 
import { style } from "./style";
import { init, TRANSLATION_ADDED } from "./translator";

export class Translator extends CustomElement {
  static style = style;

  private spanElement!: HTMLSpanElement;
  private text!: string;
  get Text() {
    return this.text;
  }
  private key!: string;
  get Key() {
    return this.key;
  }
  set Key(value: string | null) {
    if (typeof value === 'string') {
      this.key = value;
      // this.key = value.replace(/<!--\?lit.*?>(.*)/, '$1');
    }
    else {
      this.key = '';
    }

    this.updateText();
  }
  private dynamicAttributes: Set<string> = new Set<string>();
  private noupdate = false;
  private observer: MutationObserver;
  private internalset = false;

  @property({
    rerender: false,
    onUpdate: 'onscopeupdate'
  }) scope?: string;

  constructor() {
    super();

    this.observer = new MutationObserver(this.mutantobservercallback);
    this.observer.observe(this, {
      attributes: true,
    });
  }

  // class functions 
  connectedCallback(): void {
    super.connectedCallback();
    init();
    window.papLocalization?.subscribe(this.updateText);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // this.attributeObserver.disconnect();
    window.papLocalization?.unsubscribe(this.updateText);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (this.dynamicAttributes.has(name)) {
      this.updateText();
    }
  }

  firstRender(): void {
    super.firstRender();

    if (this.shadowRoot) {
      const span = this.shadowRoot.querySelector<HTMLSpanElement>('span.pap-translation-span');
      if (span) {
        this.spanElement = span;
      }
    }
  }

  // event handlers 
  private mutantobservercallback: MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => {
    if (this.internalset) {
      this.internalset = false;
      return;
    }
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName) {
        if (this.dynamicAttributes.has(mutation.attributeName)) {
          this.internalset = true;
          this.updateText();
        }
      }
    }
  }
  private handletranslateslotchange = (e: Event) => {
    if (e.target instanceof HTMLSlotElement) {
      const nodetext = ExtractSlotValue(e.target).join(' ').trim();
      this.Key = nodetext;
    }
  }

  // on update
  private onscopeupdate = () => {
    this.updateText();
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
      this.Key = key;
    }

    return this.text;
  }

  // private functions 
  private updateText = () => {
    const finalkey = (this.scope ? this.scope + "." : "") + this.key;
    let text = window.papLocalization?.current?.translations?.[finalkey] || this.key;
    if (text === undefined && this.key === undefined) return;

    const regex = /{([^{}]+)}/g;
    const matches = text.match(regex);

    if (matches) {
      matches.forEach(variable => {
        const sliced = variable.slice(1, -1);
        const value = this.getAttribute(sliced);
        if (value) {
          text = text.replace(variable, value);

          if (!this.dynamicAttributes.has(sliced)) {
            this.dynamicAttributes.add(sliced);
          }
        }
      });
    }

    this.text = text;
    if (this.spanElement) {
      this.spanElement.innerText = text;
    }
    else if (!this.noupdate) {
      this.requestUpdate();
    }

    this.internalset = false;
    this.noupdate = false;
  };

  render() {
    return html`
      <span class="pap-translation-span"></span>
      <slot style="display:none;" @slotchange="${this.handletranslateslotchange}"></slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-translator": Translator;
  }
}