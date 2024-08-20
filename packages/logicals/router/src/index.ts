import { Router } from './component.js';
import "./components/route";

// export 
export * from "./component";
export * from "./components/route";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('pap-router')) {
  window.customElements.define('pap-router', Router);
}
