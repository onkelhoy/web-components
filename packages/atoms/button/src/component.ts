// import statements 
// system 
import { bind, CustomElementInternals, html, property } from "@papit/core";
// visuals 
import "@papit/prefix-suffix";

// local 
import { style } from "./style";
import { Color, Mode, Radius, Size, Type, Variant } from "./types";

export class Button extends CustomElementInternals {
  static style = style;

  @property({ attribute: true }) href?: string;
  @property({ attribute: true }) type: Type = "button";
  @property({ attribute: true }) mode: Mode = "hug";
  @property({ attribute: true }) variant: Variant = "filled";
  @property({ attribute: true }) color: Color = "primary";
  @property({ attribute: true }) size: Size = "medium";
  @property({ attribute: true }) radius: Radius = "circle";

  constructor() {
    super();

    this.role = "button"; // WCAG
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("click", this.handleclick, true);
    this.addEventListener('keyup', this.handlekeyup);
    // NOTE should this be a standard?
    this.role = "button"; // answer yes if possible, what should icon be?, its to do with ARIA labels 
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles
  }
  firstRender(): void {
    super.firstRender();
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
  }

  // event handlers
  @bind
  private handlekeyup(e: KeyboardEvent) {
    if ((e.key || e.code).toLowerCase() === "enter") {
      this.dispatchEvent(new Event("click"));
    }
  }
  @bind
  private handleclick () {
    if (this.hasAttribute("disabled")) return;
    if (this.hasAttribute("readonly")) return;

    if (this.href) {
      window.location.href = this.href;
    }
    else if (this._internals.form) {
      if (this.type === "submit") {
        this._internals.form.requestSubmit();
      }

      else if (this.type === "reset") {
        this._internals.form.reset();
      }
    }
  }

  render() {
    return `
      <span part="overlay"></span>
      <pap-prefix-suffix part="prefix-suffix">
        <slot slot="prefix" name="prefix"></slot>
        <slot></slot>
        <slot slot="suffix" name="suffix"></slot>
      </pap-prefix-suffix>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-button": Button;
  }
}