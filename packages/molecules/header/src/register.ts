import { Language } from './components/language';
import { Header } from './component.js';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('o-header')) {
  cElements.define('o-header', Header);
}
if (!cElements.get('o-language')) {
  cElements.define('o-language', Language);
}
