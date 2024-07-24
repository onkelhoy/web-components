import { NextParent, debounce } from '../../functions';

import { Setting, Constructor, FunctionCallback } from './types';
import { PropertyInfo } from '../property';
import { ConvertFromString, renderStyle, renderHTML } from './helper';

export function Decorator<T extends Constructor>(setting?: Partial<Setting>) {

  const fixedsetting: Setting = {
    updateInterval: 100,
    attributeUpdateInterval: 10,
    reactiveRendering: true,
    reactiveStyling: false,
    ...setting
  }

  return function (constructor: T) {

    // duplications detected
    if (constructor.PAPELEMENTINIT) {

      // overrite whatever needs to be overrited but keep the decorator logic clean (no need to reapply)
      return class Base extends constructor {
        __decorator_setting = fixedsetting;
        // static observedAttributesSet: Set<string> = new Set();

        constructor(...args: any[]) {
          super(...args);

          if (this.__requestUpdate) this.requestUpdate = debounce(this.__requestUpdate, this.__decorator_setting.updateInterval);
          if (this.__updateAttribute) this.updateAttribute = debounce(this.__updateAttribute, this.__decorator_setting.attributeUpdateInterval);
        }
      };
    }

    return class Base extends constructor {

      static PAPELEMENTINIT = true; // crucial to detect duplications
      // static observedAttributes = ["hasfocus"];

      // getters 
      get observedAttributes() {
        return (this.constructor as any).observedAttributes;
      }
      get baseConstructor() {
        return Base;
      }

      __decorator_setting = fixedsetting;
      __hasrendered = false;
      __attributeinit = false;

      properties: Record<string, PropertyInfo> = {};
      delayedAttributes: Record<string, string> = {};
      callAfterRender: (Function | FunctionCallback)[] = [];
      attributeToPropertyMap: Map<string, string> = new Map();
      originalHTML!: string;

      // hasFocus: boolean = false;

      constructor(...args: any[]) {
        super(...args);

        this.callAfterRender.push(this.firstRender);
        this.originalHTML = this.outerHTML;

        this.addEventListener('blur', this.handleblur);
        this.addEventListener('focus', this.handlefocus);
        this.attributeToPropertyMap.set("hasfocus", "hasFocus");
        this.properties["hasFocus"] = {
          attribute: "hasfocus",
          propertyKey: "hasFocus",
          type: Boolean,
          typeName: 'boolean'
        }

        this.requestUpdate = debounce(this.__requestUpdate, this.__decorator_setting.updateInterval);
        this.updateAttribute = debounce(this.__updateAttribute, this.__decorator_setting.attributeUpdateInterval);
        // this.__initshadowroot = debounce(this.__initshadowroot, 5);
        // this.__initshadowroot();
        this.attachShadow({ mode: 'open' });
      }

      // __initshadowroot() {
      //   if (!this.shadowRoot) {
      //     // this.connectedCallback();
      //   }
      // }

      // class functions
      connectedCallback() {
        console.log('connected', this);
        this.__attributeinit = false;
        this.dispatchEvent(new Event('connected'));

        super.connectedCallback?.();
        this.requestUpdate?.();
      }
      disconnectedCallback() {
        this.dispatchEvent(new Event('disconnected'));

        super.disconnectedCallback?.();
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

        super.attributeChangedCallback?.(name, oldValue, newValue);
      }
      firstRender() {
        this.__hasrendered = true;
        this.updateAttribute?.();

        super.firstRender?.();
      }
      update() {
        if (!this.shadowRoot) return

        renderStyle(this.__decorator_setting, this, this.constructor as Constructor);
        renderHTML(this.__decorator_setting, this, this.constructor as Constructor);

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
      querySelector<T extends Element>(selector: string): T | null {
        if (!selector) {
          console.log('empty string')
          return null;
        }
        if (this.shadowRoot) return this.shadowRoot.querySelector<T>(selector);
        return null;
      }

      // helper functions
      getProperties(): Record<string, PropertyInfo> {
        return this.properties || {};
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
      handlefocus = () => {
        this.hasFocus = true;
      }
      handleblur = () => {
        this.hasFocus = false;
      }

      // private functions
      __requestUpdate() {
        this.update();
      }
      __initAttributes() {
        if (this.__attributeinit) return

        this.__attributeinit = true;
        // we need to check if we have any initial values ?
        const a = this.attributes;
        for (let i = 0; i < a.length; i++) {
          const name = a[i].name;
          if (this.properties[name]) {
            let value = a[i].value;
            if (value === "") value = "true";

            this[this.properties[name].propertyKey as keyof this] = ConvertFromString(value, this.properties[name].type);
          }
        }
      }
      __updateAttribute() {
        if (this.__hasrendered) {
          // we call this each time but it will probably just cancel anyway..
          this.__initAttributes();

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
  }
}