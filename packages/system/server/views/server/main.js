import "@papit/icon";
import { CustomElement } from "@papit/core";

class ImageTest extends CustomElement {
  render() {
    return `
      <img src="images/placeholder.png" />
    `
  }
}

if (!window.customElements.get('server-image-test')) {
  window.customElements.define('server-image-test', ImageTest);
}


window.onload = () => {
  const btn = document.querySelector("button");

  btn.onclick = () => {
    alert("wow some action");
  }
}