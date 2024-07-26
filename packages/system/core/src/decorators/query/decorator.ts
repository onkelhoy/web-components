import { Setting } from "./types";

export function Decorator<T extends Element = HTMLElement>(setting: string | Setting<T>) {
  const _setting: Setting<T> = {
    selector: "",
  }

  if (typeof setting === "string") {
    _setting.selector = setting;
  }
  else {
    _setting.selector = setting.selector;
    _setting.load = setting.load;
  }

  return function (target: HTMLElement, propertyKey: string) {
    const renderattemptsKey = propertyKey + 'rerender_attempts_';
    const timeoutattemptsKey = propertyKey + 'timeout_attempts_';

    // Store the original connectedCallback, if it exists
    const originalConnectedCallback = (target as any).connectedCallback || function () { };

    // Override connectedCallback
    (target as any).connectedCallback = function () {
      // Call the original connectedCallback
      originalConnectedCallback.call(this);

      // init the search
      initsearch.call(this);
    };
    function initsearch(this: any) {
      if (!search.call(this)) {
        rendersearch.call(this);
      }
    }
    function rendersearch(this: any) {
      let attempts = this[renderattemptsKey] || 0;
      attempts++;
      if (!search.call(this) && attempts < 5) {
        this[timeoutattemptsKey] = 0;
        this[renderattemptsKey] = attempts;
        setTimeout(() => timeoutsearch.call(this), 100);

        if (this.callAfterRender) this.callAfterRender.push(() => rendersearch.call(this));
      }
    }
    function timeoutsearch(this: any) {
      let attempts = this[timeoutattemptsKey] || 0;
      attempts++;
      if (!search.call(this) && attempts < 3) {
        this[timeoutattemptsKey] = attempts;
        setTimeout(() => timeoutsearch.call(this), 100);
      }
    }
    function search(this: HTMLElement) {
      if ((this as any)[propertyKey]) return true;

      if (this.shadowRoot) {
        const element = this.shadowRoot.querySelector<T>(_setting.selector);
        if (element) {
          (this as any)[propertyKey] = element;

          if (typeof _setting === "object") {
            if (_setting.load) {
              _setting.load.call(this, element);
            }
          }

          return true;
        }
      }

      return false;
    }
  }
}