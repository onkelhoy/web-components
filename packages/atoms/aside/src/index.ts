import { Aside } from './component.js';

// export 
export * from "./component.js";
export * from "./types.js";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('pap-aside')) {
  window.customElements.define('pap-aside', Aside);
}
