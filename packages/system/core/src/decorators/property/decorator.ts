/**
 * @fileoverview Implements the `@property` decorator for defining reactive properties
 * on custom elements. Supports attribute-property reflection, change callbacks, 
 * before/after hooks, and re-render triggers.
 *
 * @details
 * - Properties can be bound to attributes for automatic synchronization.
 * - Internal update prevention avoids infinite reflection loops.
 * - Supports type conversion for String, Number, Boolean, and JSON-serializable values.
 * - Includes deep equality checking to avoid redundant updates.
 *
 * @author Henry Pap (GitHub: @onkelhoy)
 * @created 2025-08-11
 */

import { parseValue, sameValue, stringifyValue } from "@functions/value";
import { Setting } from "./types";
import { PropertyMeta } from "@element/types";

const defaultSettings: Partial<Setting> = {
  readonly: false,
  rerender: false,
  maxReqursiveSteps: 20,
  removeAttribute: true,
  attribute: true,
};

/**
 * A property decorator for defining reactive properties on a custom element.
 *
 * Can be used in two forms:
 * - `@property` with no arguments → default settings applied.
 * - `@property({...})` → pass custom settings such as `attribute`, `type`, `before`, `after`, etc.
 *
 * @param settings Partial settings object controlling reflection, hooks, and behavior.
 */
export function property(settings: Partial<Setting>): PropertyDecorator;
/**
 * Overload for decorator used without arguments.
 *
 * @param target The prototype of the class.
 * @param propertyKey The property name.
 */
export function property(target: Object, propertyKey: PropertyKey): void;

export function property(
  targetOrSettings: Object | Partial<Setting>,
  maybeKey?: PropertyKey
): void | PropertyDecorator {
  // @property — no args
  if (typeof maybeKey === "string" || typeof maybeKey === "symbol") {
    define(targetOrSettings as Object, maybeKey, {});
    return; // void → valid for this overload
  }

  // @property({...}) — with config
  const settings = targetOrSettings as Partial<Setting>;
  return function (target: Object, key: PropertyKey) {
    define(target, key, settings);
  };
}

function define(target: any, propertyKey: PropertyKey, _settings: Partial<Setting>): void {
  const privateKey = String(`__${String(propertyKey)}`);
  const settings = {
    ...defaultSettings,
    ..._settings,
  }


  let internalUpdate = false;
  let attributeName:null|string = null;
  if (settings.attribute)
  {
    const constructor = target.constructor as any;
    if (!constructor.observedAttributes) constructor.observedAttributes = [];
    attributeName = typeof settings.attribute === "string" ? settings.attribute : String(propertyKey);
    constructor.observedAttributes.push(attributeName);

    const meta: PropertyMeta = target.propertyMeta ??= new Map();
    meta.set(attributeName, function (this: any, newValue, oldValue) {
      if (internalUpdate)
      {
        internalUpdate = false;
        return;
      }

      let nvalue;
      if (settings.type?.name === "Boolean" && newValue === "") 
      {
        nvalue = true;
      }
      else 
      {
        nvalue = parseValue(newValue, settings.type);
      }

      if (newValue === oldValue || sameValue(nvalue, this[propertyKey])) return;

      internalUpdate = true;

      this[privateKey] = nvalue;
      this[propertyKey] = nvalue;
    });
  }

  Object.defineProperty(target, propertyKey, {
    configurable: settings.configurable ?? true,
    enumerable: settings.enumerable ?? true,
    get() { 
      const data = this[privateKey];
      return settings?.get ? settings.get.call(this, data) : data;
    },
    set(value) {
      const isInitial = !Object.hasOwn(this, privateKey);

      // --- NEW: if it's initial set AND attribute exists, skip overriding ---
      if (isInitial && attributeName && this.hasAttribute(attributeName)) {
        return; // Let attributeChangedCallback handle it (not tested)
      }

      if (settings.readonly && Object.hasOwn(this, privateKey))
      {
        throw new TypeError(`Cannot reassign readonly property '${String(propertyKey)}'`);
      }

      const oldVal = this[privateKey];
      if (!internalUpdate && sameValue(value, oldVal)) return;

      const valuestring = stringifyValue(value, settings.type);
      if (settings.aria) this.setAttribute(settings.aria, valuestring);

      const isAttributeUpdate = internalUpdate;

      if (settings.before) settings.before.call(this, value, oldVal, isInitial, isAttributeUpdate);
      
      this[privateKey] = value;

      if (attributeName && !internalUpdate)
      {
        internalUpdate = true;
        if (settings.removeAttribute && (value === null || value === undefined || value === false))
        {
          this.removeAttribute(attributeName);
        } 
        else 
        {
          this.setAttribute(attributeName, valuestring);
        }
      }
      internalUpdate = false;

      if (settings.after) settings.after.call(this, value, oldVal, isInitial, isAttributeUpdate);
      if (!isInitial && settings.rerender) this.requestUpdate?.();
      if (settings.context) this.dispatchEvent(new Event(`context-${String(propertyKey)}`));
    },
  });
}