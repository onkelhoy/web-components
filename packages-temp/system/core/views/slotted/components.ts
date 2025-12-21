import { CustomElement, html, debounce, property } from "@papit/core";

class ComponentA extends CustomElement {
  render() {
    return html`
      <slot name="special"></slot>
      <slot></slot>
    `
  }
}

class ComponentB extends CustomElement {

  @property({ rerender: true }) content = "";
  firstRender(): void {
    super.firstRender();
    this.setup();
  }

  @debounce(1000)
  setup() {
    this.content = "HELLO WORLD"
  }

  render() {
    return html`
      <div>${this.content}</div>
      <slot></slot>
    `
  }
}

if (!window.customElements.get('core-a'))
{
  window.customElements.define('core-a', ComponentA);
}
if (!window.customElements.get('core-b'))
{
  window.customElements.define('core-b', ComponentB);
}