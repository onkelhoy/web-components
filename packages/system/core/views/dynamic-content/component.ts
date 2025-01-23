// system
import { html, property, CustomElement } from "@papit/core";

// local 
const style = ":host {background-color: blue; color:white;}"

export class TestComponent1 extends CustomElement {
  static styles = [style]

  @property({ type: Boolean, attribute: 'foo-laa' }) fooLaa: boolean = true;

  render() {
    return html`
      <p>
        <span style="font-weight: 700;">FooLaa:</span> ${this.fooLaa}
      </p>
    `
  }
}

export class TestComponent2 extends CustomElement {
  static styles = [style]

  @property({ type: Boolean, attribute: 'foo-laa' }) fooLaa: boolean = true;

  render() {
    return html`
      <p>
        <span style="font-weight: 700;">FooLaa:</span> 
        ${this.fooLaa ? "TRUE" : "FALSE"}
      </p>
    `
  }
}

export class TestComponent3 extends CustomElement {
  static styles = [style]

  @property({ type: Boolean, attribute: 'foo-laa' }) fooLaa: boolean = true;

  render() {
    return html`
      <p>
        <span style="font-weight: 700;">FooLaa:</span>
        ${this.fooLaa ? html`<p>TRUE</p>` : html`<p>FALSE</p>`}
      </p>
    `
  }
}

export class TestComponent4 extends CustomElement {
  static styles = [style]

  constructor() {
    super({
      reactiveRendering: false,
    })
  }

  @property({ type: Boolean, attribute: 'foo-laa' }) fooLaa: boolean = true;

  render() {
    return html`
      <p>
        <span style="font-weight: 700;">TEST-COMPONENT-3:</span>
        <test-component-3 foo-laa="${this.fooLaa}"></test-component-3>
      </p>
    `
  }
}


// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

// if (!cElements.get('pap-editor-input')) {
//   cElements.define('pap-editor-input', Input);
// }

if (!cElements.get('test-component-1')) {
  cElements.define('test-component-1', TestComponent1);
}
if (!cElements.get('test-component-2')) {
  cElements.define('test-component-2', TestComponent2);
}
if (!cElements.get('test-component-3')) {
  cElements.define('test-component-3', TestComponent3);
}
if (!cElements.get('test-component-4')) {
  cElements.define('test-component-4', TestComponent4);
}