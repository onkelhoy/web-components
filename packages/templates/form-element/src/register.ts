import { FormElement } from './component.js';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('pap-form-element-template')) {
  cElements.define('pap-form-element-template', FormElement);
}
