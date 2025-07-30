import { TabsTrigger } from './component.js';

// export 
export * from "./component";
export * from "./types";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('pap-tabs-trigger')) {
  window.customElements.define('pap-tabs-trigger', TabsTrigger);
}
