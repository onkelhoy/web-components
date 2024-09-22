import {html} from "@papit/core";
import {BinaryFormElement} from '@papit/binary-form-element';

class Test extends BinaryFormElement {
  render() {
    return html`
      <style>
        :host {
          background: transparent;
          display: inline-block;
          width: 1rem;
          height: 1rem;
          content: '';
        }
        :host([checked]) {
          background: blue;
        }

        :host([disabled]) {
          background: #eee;
        }
        :host([disabled][checked]) {
          background: #aaa;
        }
      </style>
    `
  }
}

window.customElements.define("binary-test", Test);

window.onload = () => {
  const form = document.querySelector("form");
  form.onsubmit = (e) => {
    const data = new FormData(e.target);
    console.log({a: data.get("a"), b: data.get("b"), c: data.get("c")});
    e.preventDefault();
  }
}