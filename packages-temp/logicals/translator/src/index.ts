import { Translator } from './component.js';
import { Localization } from './components/localization/component.js';

// export 
export * from "./component";
export * from "./types";
export * from "./components/localization";

// initialize localization - can be re-intialized again to improve its settings 
new Localization();
// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('pap-translator')) {
  window.customElements.define('pap-translator', Translator);
}