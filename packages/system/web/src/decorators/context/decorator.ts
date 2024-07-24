import { NextParent } from "../../functions";
import { ConvertToString } from "../property";

import { Setting } from "./types";

export function Decorator(setting?: Setting) {
  // const _options = JSON.parse(JSON.stringify(setting === undefined ? DefaultSettings : { ...DefaultSettings, ...(setting as ContextOption) }));
  const _setting = {
    rerender: true,
    verbose: false,
    ...(setting || {}),
  }

  return function (target: any, propertyKey: string) {
    // assign default values 
    if (!_setting.name) _setting.name = propertyKey;
    if (!_setting.attribute) _setting.attribute = propertyKey;

    // Storing original connectedCallback if it exists
    const originalConnectedCallback = target.connectedCallback;

    // Override the connectedCallback to set up context subscription
    target.connectedCallback = function () {
      const me = this;
      const contextname = _setting.name + "_subcontext";
      me[contextname] = true;

      // Call original connectedCallback if it exists
      if (originalConnectedCallback) originalConnectedCallback.call(me);

      if (_setting.verbose) console.log("connected-callback", _setting)

      let parent = NextParent(me) as any;

      while (parent) {
        // check if parent is our selector
        if (_setting.verbose) console.log('finding parent', parent);

        // NOTE we need to find the orignal parent so we need to make sure it does not have the name with "{name}_subcontext" also
        if (_setting.name as string in parent && !(contextname in parent)) {
          break;
        }
        if (_setting.attribute && parent.hasAttribute(_setting.attribute) && !(contextname in parent)) {
          break;
        }

        if (_setting.verbose) {
          console.log('did not find', _setting.name, 'in', parent)
        }

        if (parent === document.documentElement) {
          parent = null;
          break;
        }
        parent = NextParent(parent);
      }

      if (_setting.verbose) console.log('final parent', parent);

      if (parent) {

        const operation = () => {
          if (_setting.verbose) console.log('context-update', _setting.name, _setting.attribute)

          const old = me[_setting.name as string];
          if (_setting.name as string in parent) {
            me[_setting.name as string] = parent[_setting.name as string];
          }
          else if (_setting.attribute && parent.hasAttribute(_setting.attribute)) {
            me[_setting.name as string] = parent.getAttribute(_setting.attribute);
          }

          if (_setting.applyattribute) {
            if (me[_setting.name as string] === undefined) {
              // TODO need to check if this would cause issues with type:boolean = true values - is value true or undefined?
              this.removeAttribute(_setting.attribute);
            }
            else if (!(me[_setting.name as string] instanceof Object)) {
              const valuestring = ConvertToString(me[_setting.name as string], String);
              this.setAttribute(_setting.attribute, valuestring);
            }
          }

          if (_setting.update) {
            _setting.update.call(this, me[_setting.name as string], old);
          }

          if (_setting.rerender) {
            me.requestUpdate();
          }
        }

        // init value
        operation();

        // Subscribe to context changes
        parent.addEventListener(`context-${_setting.name}`, operation);
        // if (DEV_MODE) parent.addEventListener('context-manual-change', operation);
        parent.addEventListener('context-manual-change-banana', operation);
      } else {
        console.warn(`Context provider for '${_setting.name}' not found.`);
      }
    }
  }
}