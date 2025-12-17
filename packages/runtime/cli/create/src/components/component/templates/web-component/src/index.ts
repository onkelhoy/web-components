import { PLACEHOLDER_CLASS_NAME } from './component.js';

// export 
export * from "./component";
export * from "./types";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('PLACEHOLDER_HTML_NAME')) {
  window.customElements.define('PLACEHOLDER_HTML_NAME', PLACEHOLDER_CLASS_NAME);
}
