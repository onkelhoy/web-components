import { FixedSetting, PropertyInfo, Setting } from "./types";
// import { CustomElement, CustomElementConstructor } from '../element';
import { CustomElement } from '../../class/element';
import { ConvertToString, getInfo } from "./helper";

const defaultSettings: Setting = {
  type: String,
  attribute: true,
  rerender: true,
  verbose: false,
}

export function Decorator(setting?: Partial<Setting>) {
  const _settings: Setting = {
    ...defaultSettings,
    ...(setting || {})
  };

  return function (target: CustomElement, propertyKey: string) {

    const propertykey_hidden = `_${propertyKey}`;
    const attributeName = (typeof _settings.attribute === "string" ? _settings.attribute : propertyKey).toLowerCase();

    let INITVALUE: any;

    // NOTE this object has not been initialized yet, this is where we must inject the observedAttribute list

    const constructor = target.constructor as any;
    const observedAttributes = constructor.observedAttributes || [];
    if (!observedAttributes.some((v: string) => v === attributeName)) observedAttributes.push(attributeName);
    constructor.observedAttributes = observedAttributes;

    Object.defineProperty(target, propertyKey, {
      set(value: any) {
        INITVALUE = value;
      }
    });

    const originalconnectedcallback = target.connectedCallback;
    target.connectedCallback = function () {

      // NOTE
      // we make sure the property cannot be overriden -  configurable: false
      // this throws a error thus the try catch
      try {
        Object.defineProperty(this, propertyKey, {
          configurable: false, // default
          get() {
            const data: any = (this as any)[propertykey_hidden];
            return _settings?.get ? _settings.get.call(this, data) : data;
          },
          set(value: any) {
            if (_settings?.set) value = _settings.set.call(this, value);

            const info = getInfo.call(this, propertyKey, attributeName, _settings);
            const valuestring = ConvertToString(value, _settings.type);

            if (this.delayedAttributes && this.delayedAttributes[attributeName] && this.delayedAttributes[attributeName] === valuestring) {
              return;
            }

            const oldvaluestring = ConvertToString((this as any)[propertykey_hidden], _settings.type)
            if (oldvaluestring === valuestring) {
              return;
            }

            if (_settings.attribute) {
              if (!this.delayedAttributes) {
                this.delayedAttributes = {};
              }
              if (this.delayedAttributes[attributeName] !== valuestring) {
                // if (this.tagName === "PAP-INPUT") console.log("DECORATOR", attributeName)
                this.delayedAttributes[attributeName] = valuestring;
                this.updateAttribute();
              }
            }
            if (_settings?.before) _settings.before.call(this, value);

            const old = (this as any)[propertykey_hidden];
            (this as any)[propertykey_hidden] = value;

            if (_settings.rerender) this.requestUpdate?.();
            if (_settings?.after) _settings.after.call(this, value, old);
            if (_settings.context) this.dispatchEvent(new Event(`context-${propertyKey}`));
          }
        });
      }
      catch (e) { }

      if (!(this as any)[propertyKey]) (this as any)[propertyKey] = INITVALUE

      // NOTE conclusion: 
      // problem was that we needed childs property over parent, by putting the orignalcallback first we could have that working, 
      // but then we have default value already set which we dont want as well, so this solution yeilds good result for us.
      originalconnectedcallback?.call(this);
    }
  }
}