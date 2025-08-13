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

import { Setting } from "./types";
import { PropertyMeta } from "@element/types";

const defaultSettings: Partial<Setting> = {
  readonly: false,
  rerender: false,
  maxReqursiveSteps: 20,
  removeAttribute: true,
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

      const nvalue = parseAttributeValue(newValue, settings.type);
      const ovalue = parseAttributeValue(oldValue, settings.type);

      if (sameValue(nvalue, ovalue)) return;

      internalUpdate = true;
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

      

      const isAttributeUpdate = internalUpdate;

      if (settings.before) {
        settings.before.call(this, value, oldVal, isInitial, isAttributeUpdate);
      }
      
      this[privateKey] = value;

      if (attributeName && !internalUpdate)
      {
        internalUpdate = true;
        if ((value === null || value === undefined || value === false) && settings.removeAttribute)
        {
          this.removeAttribute(attributeName);
        } 
        else 
        {
          this.setAttribute(attributeName, stringifyPropertyValue(value, settings.type));
        }
      }
      internalUpdate = false;

      if (settings.after) {
        settings.after.call(this, value, oldVal, isInitial, isAttributeUpdate);
      }

      if (!isInitial && settings.rerender && typeof this.requestUpdate === 'function') {
        this.requestUpdate();
      }
    },
  });
}


// helper functions 
/**
 * Converts an attribute string value into the appropriate type.
 */
function parseAttributeValue(value:string|null|undefined, type: Function = String) {
  if (value === null || value === undefined) return value;

  switch (type.name)
  {
    case "String":
      return String(value);
    case "Number":
      return Number(value);
    case "Boolean": {
      if (/(false|f|0|)/i.test(value)) return false;
      return !!value; 
    }
    default: {
      // could enhance with allowing Elements to be but I think at that point bigger issues would exists 
      if (/(element|node)$/i.test(type.name))
      {
        throw new Error("[error]: cannot handle elements as properties");
      }

      return JSON.parse(value);
    }
  }
}
/**
 * Converts a property value into a string suitable for an attribute.
 */
function stringifyPropertyValue(value: any, type: Function = String) {
  switch (type.name)
  {
    case "String":
    case "Number":
    case "Boolean":
      return String(value);
    default:
      return JSON.stringify(value);
  }
}

/**
 * Deep equality check with recursion limit.
 *
 * @throws If recursion exceeds `maxReqursiveSteps`.
 */
function sameValue(a:any, b:any, maxReqursiveSteps = 20, reqursiveSteps = 0) {
  if (reqursiveSteps > maxReqursiveSteps) 
  {
    console.trace({a, b, maxReqursiveSteps});
    throw new Error("[decorator] value is exciding the maxReqursiveSteps");
  }

  if (typeof a !== typeof b) return false;
  switch (typeof a) 
  {
    case "string":
    case "number":
    case "boolean":
      return a === b;
    
    case "object": 
    {
      if (Array.isArray(a))
      {
        if (!Array.isArray(b)) return false;

        if (a.length !== b.length) return false;
        if (a.some((v, i) => !sameValue(v, b[i], maxReqursiveSteps, reqursiveSteps + 1))) return false;
        return true;
      }

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;
      for (let i=0; i<keysA.length; i++)
      {
        if (keysA[i] !== keysB[i]) return false;
        if (!sameValue(a[keysA[i]], b[keysB[i]], maxReqursiveSteps, reqursiveSteps + 1)) return false;
      }

      return true;
    }
    default:
      if (a !== undefined)
      {
        console.warn("[decorator]: unsopprted type detected", typeof a, typeof b, a, b);
      }
      return a === b;
  }
}