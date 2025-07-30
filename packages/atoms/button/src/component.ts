// import statements 
// system 
import { CustomElementInternals, html, property, Size, Radius, debounce, Color } from "@papit/core";
// visuals 
import "@papit/prefix-suffix";

// local 
import { style } from "./style";
import { Mode, Type, Variant } from "./types";

export class Button extends CustomElementInternals {
  static style = style;

  @property({ rerender: false }) href?: string;
  @property({ rerender: false }) type: Type = "button";
  @property({ rerender: false }) mode: Mode = "hug";
  @property({ rerender: false }) variant: Variant = "filled";
  @property({ rerender: false }) color: Color = "primary";
  @property({ rerender: false }) size: Size = "medium";
  @property({ rerender: false }) radius: Radius = "circle";
  @property({ rerender: false, type: Boolean }) ripple: boolean = false;

  private pressed?: number = undefined;

  constructor() {
    super();

    this.role = "button"; // WCAG
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener("click", this.handleclick, true);
    this.addEventListener("mousedown", this.handlemousedown);
    this.addEventListener("touchstart", this.handletouchstart);
    this.addEventListener("keydown", this.handlekeydown);

    this.addEventListener("mouseup", this.handlepressfinished);
    this.addEventListener("touchend", this.handlepressfinished);
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
  private handletouchstart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.calculatecircle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }
  private handlemousedown = (e: MouseEvent) => {
    this.calculatecircle(e.clientX, e.clientY);
  }
  private handlekeydown = (e: KeyboardEvent) => {
    if ((e.key || e.code).toLowerCase() === "enter") {
      this.calculatecircle();
    }
  }
  private handlekeyup = (e: KeyboardEvent) => {
    if ((e.key || e.code).toLowerCase() === "enter") {
      this.handlepressfinished();
      this.dispatchEvent(new Event("click"));
    }
  }
  private handlepressfinished = () => {
    if (!this.pressed) return;
    if (!this.ripple) return;

    const time = performance.now() - this.pressed;
    this.pressed = undefined;

    if (320 - time < 0) this.classList.remove("click");
    else setTimeout(() => this.classList.remove("click"), 320 - time);
  }
  private handleclick = () => {
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

  // helper 
  private calculatecircle(x?: number, y?: number) {
    if (this.pressed) return;
    if (!this.ripple) return;

    if (!x || !y || this.hasAttribute("circle") || this.hasAttribute("square")) {
      this.style.setProperty("--x", "50%");
      this.style.setProperty("--y", "50%");
      this.style.setProperty("--grow-target", "10");
    }
    else {
      const clientbox = this.getBoundingClientRect();
      const px = x - clientbox.left;
      const py = y - clientbox.top;

      this.style.setProperty("--x", px + "px");
      this.style.setProperty("--y", py + "px");
      const center = {
        x: (clientbox.right - clientbox.left) / 2,
        y: (clientbox.bottom - clientbox.top) / 2,
      }
      const distance = Math.sqrt(Math.pow(center.x - px, 2) + Math.pow(center.y - py, 2));
      const growtarget = 10 + (distance / Math.max(center.x, center.y)) * 10; // we use 10 as the starting width is 10% (so 10 * 10 = 100)
      // from the center point we need to know how much we are off 
      // from x=0 we should grow to 200%, if x=center we should grow to 100% 
      this.style.setProperty("--grow-target", growtarget.toString());
    }

    this.pressed = performance.now();
    this.classList.remove("click");
    setTimeout(() => {
      this.classList.add("click");
    }, 1);
  }

  render() {
    return html`
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