import {html, CustomElement} from "@papit/core";
import {Translator} from '@papit/translator';

class InsideDemo extends CustomElement {
  render() {
    return html`
      <pap-translator>${this.getAttribute('text')}</pap-translator>
    `
  }
}

class ExtendDemo extends Translator {
  render() {
    return html`
      <label>${this.translateKey('bajs')}</label>
    `
  }
}

class ExtendDemo2 extends Translator {
  render() {
    return html`
      <label>${this.translateKey('Hello {name}', {name: this.getAttribute('name')})}</label>
    `
  }
}

class ScopeDemo extends Translator {
  render() {
    this.scope = 'scope';
    return html`
      <label>${this.translateKey('bajs')}</label>
    `
  }
}

const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('translate-insidedemo')) {
  cElements.define('translate-insidedemo', InsideDemo);
}

if (!cElements.get('translate-extenddemo')) {
  cElements.define('translate-extenddemo', ExtendDemo);
}

if (!cElements.get('translate-extenddemo2')) {
  cElements.define('translate-extenddemo2', ExtendDemo2);
}

if (!cElements.get('translate-scopedemo')) {
  cElements.define('translate-scopedemo', ScopeDemo);
}
