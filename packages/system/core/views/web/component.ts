// system
import { html, property, query, CustomElement } from "@papit/core";

// local 
const style = ":host {background-color: blue; color:white;}"

type AO = {
  bajs: number;
  name: string;
}

export class TestComponent1 extends CustomElement {
  static styles = [style]

  @property() foo: string = "bar";
  @property({ type: Number }) bajs: number = 44;
  @property({ type: Boolean, attribute: 'foo-laa' }) fooLaa: boolean = true;
  @property({ type: Object, attribute: 'veryvery-goooood' }) good: AO = { bajs: 44, name: 'banan' };

  @query({
    selector: 'header', load: function (this: TestComponent1) {
      console.log('element loaded')
    }
  }) headerElement!: HTMLElement;

  render() {
    return html`
      <header part="header">
        <slot name="header">
          <h1>${this.foo}</h1>
        </slot>
      </header>
    `
  }
}


export class TestComponent2 extends CustomElement {
  static style = style;

  @property() foo: string = "bar";
  @property() OK: string = "bar";
  @property() bajsapa: string = "bar";
  @property() heheh: string = "bar";

  render() {
    return html`
      <header part="header">
        <slot name="header">
          <h1>${this.foo}</h1>
        </slot>
      </header>
    `
  }
}

export class TestComponent3 extends TestComponent1 {
  static styles = [...TestComponent1.styles, ':host {background-color: red;color:black;}']

  @property() snoske: string = "bar";
  @property() foo: string = "BAAJS";

  render() {
    return html`
      <header part="header">
        <slot name="header">
          <h1>${this.foo}</h1>
        </slot>
      </header>
    `
  }
}


export class TestComponent4 extends TestComponent3 {
  static style = ':host {background-color: yellow;}';

  @property() SLISKENOCHPISKEN = "hejsansvejkasn"

  render() {
    return html`
      <header part="header">
        <slot name="header">
          <h1>${this.foo}</h1>
        </slot>
      </header>
    `
  }
}

export class TestComponent5 extends CustomElement {
  static style = ':host {}';

  private handleclick = (e: Event) => {
    this.dispatchEvent(new Event('apply'));
  }

  render() {
    return html`
      <button @click="${this.handleclick}"><slot /></button>
    `
  }
}

export class TestComponent6 extends CustomElement {
  static style = ':host {}';

  render() {
    return html`
      <div>
        <p>Hello Mister</p>
        <slot />
      </div>
    `
  }
}

export class TestComponent7 extends CustomElement {
  static style = ':host {}';

  @property({ type: Boolean }) ok: boolean = false;

  private handleapply = (e: Event) => {
    console.log('apply', (e.target as HTMLButtonElement).getAttribute('id'));
  }

  private renderarray = () => {
    const arr = [];
    arr.push(html`
      <test-component-5 @apply="${this.handleapply}" id="button1">button 1</test-component-5>
    `);
    if (this.ok) {
      arr.push(html`
        <test-component-5 @apply="${this.handleapply}" id="button2">button 2</test-component-5>
      `);
    }

    return arr;
  }

  render() {
    return html`
      <test-component-6>
        hello
        ${this.renderarray()}
      </test-component-6>
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

if (!cElements.get('test-component-5')) {
  cElements.define('test-component-5', TestComponent5);
}

if (!cElements.get('test-component-6')) {
  cElements.define('test-component-6', TestComponent6);
}

if (!cElements.get('test-component-7')) {
  cElements.define('test-component-7', TestComponent7);
}