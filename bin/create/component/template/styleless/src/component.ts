// import statements 
// system 
import { CustomElement, property } from "@papit/core";

// local 
import { ClickEvent } from "./types";

export class PLACEHOLDER_CLASS_NAME extends CustomElement {

  // properties 
  @property({ type: Boolean }) foo: boolean = false;

  // event handlers
  private handleclick = () => {
    this.dispatchEvent(new CustomEvent<ClickEvent>("main-click", { detail: { timestamp: performance.now() } }));
  }
}