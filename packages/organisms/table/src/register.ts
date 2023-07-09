import { Menu } from './components/menu';
import { CellTitle } from './components/cell-title';
import { Cell } from './components/cell';
import { Table } from './component.js';

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('o-table')) {
  cElements.define('o-table', Table);
}
if (!cElements.get('o-cell')) {
  cElements.define('o-cell', Cell);
}
if (!cElements.get('o-cell-title')) {
  cElements.define('o-cell-title', CellTitle);
}
if (!cElements.get('o-menu')) {
  cElements.define('o-menu', Menu);
}
