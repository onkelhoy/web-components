import { PropertyInfo, property } from "../../decorators/property";
import { NextParent, debounce } from "../../functions";
import { ConvertFromString, renderHTML, renderStyle } from "./helper";
import { FunctionCallback, RenderType, Setting } from "./types";

export class CustomElement extends HTMLElement {

  static observedAttributes = [];
  static style: string;
  static styles: string[];

  private attributeinit = false;
  private delayedAttributes: Record<string, string> = {};

  protected callAfterRender: (Function | FunctionCallback)[] = [];

  attributeToPropertyMap: Map<string, string> = new Map();
  hasrendered = false;
  setting: Setting;
  properties: Record<string, PropertyInfo> = {};
  originalHTML: string;
  rendercomperator!: HTMLTemplateElement;
  stylecomperator!: HTMLStyleElement;

  @property({ type: Boolean, rerender: false }) hasFocus: boolean = false;

  constructor(setting?: Partial<Setting>) {
    super();

    this.setting = {
      updateInterval: 100,
      attributeUpdateInterval: 10,
      reactiveRendering: true,
      reactiveStyling: false,
      noblur: false,
      nofocus: false,
      mode: 'open',
      delegatesFocus: false,
      noshadow: false,
      ...(setting || {})
    }
    if (!this.setting.noshadow) {
      this.attachShadow({ ...this.setting });
    }
    this.callAfterRender.push(this.firstRender);
    this.originalHTML = this.outerHTML;

    if (!this.setting.noblur) this.addEventListener('blur', this.handleblur);
    if (!this.setting.noblur) this.addEventListener('focus', this.handlefocus);

    this.requestUpdate = debounce(this.requestUpdate, this.setting.updateInterval);
    this.updateAttribute = debounce(this.updateAttribute, this.setting.attributeUpdateInterval);
  }

  // class functions
  connectedCallback() {
    this.attributeinit = false;
    this.dispatchEvent(new Event('connected'));
    this.requestUpdate?.();
  }
  disconnectedCallback() {
    this.dispatchEvent(new Event('disconnected'));
  }
  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    const delayedattribute = this.delayedAttributes[name];
    delete this.delayedAttributes[name];

    if (oldValue === newValue) return;

    if (!delayedattribute) {
      const propertyKey = this.attributeToPropertyMap.get(name);

      // NOTE when propertyKey not defined its coming from a HTML manually set attribute
      if (propertyKey) {
        const info = this.properties[propertyKey];
        if (info) {
          this[info.propertyKey as keyof this] = ConvertFromString(newValue, info.type);
        }
        else {
          console.warn("[BASE]: not delayed not prop options", name);
        }
      }
      // else throw new Error('could not find attribute');
    }
  }
  firstRender() {
    this.hasrendered = true;
    this.updateAttribute?.();
  }
  __update() {
    if (!this.shadowRoot) return

    renderStyle(this.setting, this);
    renderHTML(this.setting, this);

    let info;
    const reverse = this.callAfterRender.reverse();
    while (info = reverse.pop()) {
      if (typeof info === "object") {
        info.callback.call(this, ...info.args);
      }
      if (info instanceof Function) {
        info.call(this);
      }
    }
    this.callAfterRender = [];
  }
  public render(config?: any): RenderType {
    return 'Hello From Base Class'
  }

  // helper functions
  querySelector<T extends Element>(selector: string): T | null {
    if (!selector) {
      console.log('empty string')
      return null;
    }
    if (this.shadowRoot) return this.shadowRoot.querySelector<T>(selector);
    return null;
  }
  originalQuerySelector<T extends Element>(selector: string): T | null {
    if (!selector) {
      console.log('empty string')
      return null;
    }
    return super.querySelector<T>(selector);
  }
  getProperties(): Record<string, PropertyInfo> {
    return this.properties || {};
  }
  getStyle() {
    // Get the constructor of the child class
    const childConstructor = (this.constructor as any) as typeof CustomElement & { style?: string; styles?: string[]; };

    // Access the static property on the child class
    const styles = [
      ...(childConstructor.styles ?? []),
      ...(typeof childConstructor.style === "string" ? [childConstructor.style] : []),
    ];

    return styles.join(' ');

    // let styles: string[] = [];
    // if ((this.constructor as Base).styles) styles = [...(this.constructor as Base).styles];
    // if ((this.constructor as Base).style) styles.push((this.constructor as Base).style);

    // return styles.join(' ');
  }
  shadow_closest<T extends Element = HTMLElement>(selector: string) {
    let parent = NextParent(this);

    while (parent) {
      // check if parent is our selector
      const closest = parent.closest<T>(selector);
      if (closest) return closest;

      const target = parent.querySelector<T>(selector);
      if (target) return target;

      if (parent === document.documentElement) break;
      parent = NextParent(parent);
    }
  }
  requestUpdate() {
    this.__update();
  }

  // event handlers
  protected handleblur = () => {
    this.hasFocus = false;
  }
  protected handlefocus = () => {
    this.hasFocus = true;
  }

  // private functions
  private initAttributes() {
    if (this.attributeinit) return

    this.attributeinit = true;
    // we need to check if we have any initial values ?
    const a = this.attributes;
    for (let i = 0; i < a.length; i++) {
      const name = a[i].name;
      const propertykey = this.attributeToPropertyMap.get(name);
      if (propertykey && this.properties[propertykey]) {
        let value = a[i].value;
        if (value === "") value = "true";

        this[this.properties[propertykey].propertyKey as keyof this] = ConvertFromString(value, this.properties[propertykey].type);
      }
    }
  }
  private updateAttribute() {
    if (this.hasrendered) {
      // we call this each time but it will probably just cancel anyway..
      this.initAttributes();

      for (let name in this.delayedAttributes) {
        const value = this.delayedAttributes[name];
        if (value === undefined) this.removeAttribute(name);
        else {
          this.setAttribute(name, value);
        }
      }
    }
  }
}