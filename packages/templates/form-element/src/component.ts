// system
import { property, debounce, CustomElement, RenderType, CustomElementSetting } from "@pap-it/system-utils";

// local 
export class FormElement extends CustomElement {
  static formAssociated = true;

  protected _internals: ElementInternals;
  private defaultinternal = false;
  protected element?: HTMLElement;

  @property({
    attribute: 'default-value',
    after: function (this: FormElement, value: string) {
      if (!this.defaultinternal) this.value = value;
      this.defaultinternal = false;
    }
  }) defaultValue?: string;
  @property({
    type: Boolean,
    after: function (this: FormElement, value?: boolean) {
      if (value) {
        this.setAttribute('aria-disabled', 'true');
      }
      else {
        this.setAttribute('aria-disabled', 'false');
      }
    }
  }) disabled?: boolean;
  @property({ rerender: false }) name: string = "missing-name";
  @property({
    after: function (this: FormElement, value: string) {
      this.updateform(value);
      this.debouncedchange();
    }
  }) value?: string;

  constructor(setting?: Partial<CustomElementSetting>) {
    super(setting);
    this._internals = this.attachInternals();
    this.debouncedchange = debounce(this.debouncedchange, 120);
  }

  firstRender(): void {
    super.firstRender();
    if (this.defaultValue === undefined) {
      this.defaultinternal = true;
      this.defaultValue = this.value;
    }
  }

  public formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  public formAssociatedCallback(form: HTMLFormElement) {
    // do something
  }

  public formStateRestoreCallback(state: any, mode: any) {
    console.log('[field]: formStateRestoreCallback', { state, mode })
  }

  public checkValidity(): boolean {
    if (this._internals === undefined) return true;
    return this._internals?.checkValidity();
  }

  public reportValidity(): boolean {
    if (this._internals === undefined) return true;
    return this._internals?.reportValidity();
  }

  public get validity(): ValidityState {
    if (this.element && 'validity' in this.element) {
      return this.element.validity as ValidityState;
    }
    if (this._internals === undefined) return { valid: true } as ValidityState;
    return this._internals.validity;
  }

  public get validationMessage(): string {
    if (this.element && 'validationMessage' in this.element) {
      return this.element.validationMessage as string;
    }
    if (this._internals === undefined) return "";
    return this._internals.validationMessage;
  }

  public setValidity(flags?: ValidityStateFlags | undefined, message?: string | undefined, anchor?: HTMLElement | undefined) {
    if (!this._internals === undefined) return;
    this._internals.setValidity(flags, message, anchor || undefined);
  }

  public formResetCallback() {
    this.value = this.defaultValue;
    if (this.element && 'value' in this.element) {
      this.element.value = this.value || "";
    }
  }

  // public setCustomValidity(message?: string) {
  //   if (this.element && 'setCustomValidity' in this.element)
  //   {
  //     this.element.setCustomValidity(message);
  //   }
  //   if (this._internals === undefined) return "";
  //   return this._internals.setCustomValidity();
  // }

  // private functions
  protected connectElement(element: HTMLElement) {
    if (!this.element) this.element = element;
  }
  protected updateform(value?: string) {
    if (this._internals !== undefined) {
      this._internals.setFormValue(value || null);
    }
  }
  protected validateElement() {
    // do something 
  }
  protected debouncedchange() {
    this.dispatchEvent(new Event('change'));
    this.validateElement();
  }
}


declare global {
  interface HTMLElementTagNameMap {
    "pap-form-element-template": FormElement;
  }
}