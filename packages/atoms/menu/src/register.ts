import { MenuItem } from './components/menu-item';
import { Menu } from './component.js';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('o-menu')) {
  cElements.define('o-menu', Menu);
}
if (!cElements.get('o-menu-item')) {
  cElements.define('o-menu-item', MenuItem);
}
