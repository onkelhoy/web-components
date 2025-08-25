import { html, CustomElement, property, } from "@papit/core";


class InsideComponent extends CustomElement {
  @property({ rerender: true }) name = "bajs";

  render() {
    return html`
      <p>${this.name}</p>
    `
  }
}

class OutsideComponent extends CustomElement {
  @property({ rerender: true }) name = "henry";

  render() {
    return html`
      <p>${this.name}</p>
      <attr-inside name="${this.name}"></attr-inside>
    `
  }
}
class SelectComponent extends CustomElement {
  @property({ rerender: true }) name = "henry";

  render() {
    return html`
      <select>
        <option value="henry" ${this.name === "henry" && "selected"}>henry is selcted</option>
        <option value="oscar" ${this.name === "oscar" && "selected"}>oscar is selcted</option>
        <option value="bajs" ${this.name === "bajs" && "selected"}>bajs is selcted</option>
      </select>
    `
  }
}

window.customElements.define("attr-select", SelectComponent);
window.customElements.define("attr-inside", InsideComponent);
window.customElements.define("attr-outside", OutsideComponent);