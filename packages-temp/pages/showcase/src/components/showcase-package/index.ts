import { ShowcasePackage } from './component.js';

// export 
export * from "./component";
export * from "./types";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('pap-showcase-package')) {
  window.customElements.define('pap-showcase-package', ShowcasePackage);
}
