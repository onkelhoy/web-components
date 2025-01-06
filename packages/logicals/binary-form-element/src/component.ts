// import statements 
// system 
import { CustomElementInternals, property } from "@papit/core";

export class BinaryFormElement extends CustomElementInternals {

  @property({
    rerender: false,
    type: Boolean,
    attribute: 'default-checked',
    after: function (this: BinaryFormElement) {
      if (this.defaultchecked !== undefined && this.checked === undefined) {
        this.internalflag = true;
        this.checked = this.defaultchecked;
      }
    }
  }) defaultchecked?: boolean;
  @property({
    type: Boolean,
    removeAttribute: true,
    aria: 'aria-checked',
    after: function (this: BinaryFormElement) {
      this.afterchecked();
    }
  }) checked?: boolean;
  private internalflag = false;

  constructor() {
    super();
    this.role = "checkbox";
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("click", this.handleclick, true);
    this.addEventListener("keydown", this.handlekeydown);
    this.addEventListener('keyup', this.handlepressfinished);
    this.addEventListener('blur', this.handleblur_internal);
  }
  firstRender(): void {
    super.firstRender();
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;

    window.setTimeout(() => {
      if (this.defaultchecked === undefined) {
        // initiate default-checked to first value?
        this.defaultchecked = !!this.checked;
      }
    }, 100);
  }

  private handleblur_internal = () => {
    this.classList.remove("active");
  };

  get name() {
    return this.getAttribute("name");
  }

  // protected methods
  protected afterchecked() {
    // update the form value?
    if (this._internals !== undefined) {
      this._internals.setFormValue(typeof this.checked === "boolean" ? String(this.checked as boolean) : null);
    }
    if (!this.internalflag) {
      this.dispatchEvent(new Event("change"));
    }
    this.internalflag = false;
  }

  // event handlers
  private handlekeydown = (e: KeyboardEvent) => {
    if (this.hasAttribute("disabled")) return;
    if (this.hasAttribute("readonly")) return;

    if ((e.key || e.code).toLowerCase() === "enter") {
      this.classList.add('active');
    }
  }
  private handlepressfinished = (e: KeyboardEvent) => {
    if (this.hasAttribute("disabled")) return;
    if (this.hasAttribute("readonly")) return;

    if ((e.key || e.code).toLowerCase() === "enter") {
      this.classList.remove('active');
      this.dispatchEvent(new Event("click"));
    }
  }
  private handleclick = () => {
    if (this.hasAttribute("disabled")) return;
    if (this.hasAttribute("readonly")) return;

    this.checked = !this.checked;
  }

  // form events
  public formResetCallback() {
    if (this.defaultchecked !== undefined) {
      this.checked = this.defaultchecked as boolean;
    }
  }
}