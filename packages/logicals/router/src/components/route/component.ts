// import statements 
// system 
import { CustomElement, html, property } from "@papit/core";


export class Route extends CustomElement {

  // properties 
  @property({ rerender: false }) path!: string;
  @property({ rerender: false }) realpath!: string;

  render() {
    return "";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-route": Route;
  }
}