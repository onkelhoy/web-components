// utils 
import { html, property, CustomElement, query } from "@pap-it/system-utils";
import "@pap-it/templates-popover/wc";

// templates

import { style } from "./style";
import { ChangeEvent, Input } from "../Input";
import { ColorEvent, ColorPicker } from "../ColorPicker";

function toHEX(value: number) {
  const h = value.toString(16);
  if (h.length === 1) return `0${h}`;
  return h;
}


export class ColorPickerInput extends CustomElement {
  static style = style;

  private input_element!: Input;
  private manual = false;

  @query<ColorPicker>({
    selector: 'color-picker',
    load: function (this: ColorPickerInput) {
      this.onvalueupdate();
    }
  }) colorpicker_element!: ColorPicker;

  @property() name: string = "Color"
  @property() label: string = ""
  @property({
    after: function (this: ColorPickerInput) {
      this.onvalueupdate();
    }
  }) value: string = "red";


  // // class functions 
  // constructor() {
  //   super();

  //   this.debouncedChange = debounce(this.debouncedChange, 250);
  // }
  // firstRender(): void {
  //   if (this.shadowRoot && !this.colorpicker_element) {
  //     const picker = this.shadowRoot.querySelector<ColorPicker>("color-picker");
  //     if (picker) {
  //       this.colorpicker_element = picker;
  //     }
  //     const input = this.shadowRoot.querySelector<Input>("doc-input");
  //     if (input) {
  //       this.input_element = input;
  //     }
  //   }

  //   if (this.colorpicker_element && this.input_element) {
  //     this.onvalueupdate();
  //   }
  // }

  // update functions
  private onvalueupdate() {
    if (this.colorpicker_element) {
      this.setColor(this.value);
    }
  }
  // event handlers
  private handleinputchange = (e: CustomEvent<ChangeEvent>) => {
    // const value = e.detail.value;

    // if (!this.manual) {
    //   const [r, g, b] = Color.cssToRGB(value);
    //   const hsl = Color.rgbToHSL(r, g, b);
    //   if (this.colorpicker_element) {
    //     this.colorpicker_element.setColor(hsl);
    //   }
    //   this.style.setProperty("--display-color", e.detail.value);
    //   this.debouncedChange(e.detail.value);
    // }
    // this.manual = false;
  }
  private handlecolorchange = (e: CustomEvent<ColorEvent>) => {
    // const [r, g, b] = Color.cssToRGB(e.detail.value);
    // const hex = `#${toHEX(r)}${toHEX(g)}${toHEX(b)}`;

    // if (this.input_element) {
    //   this.manual = true;
    //   this.input_element.value = hex;
    // }

    // this.style.setProperty("--display-color", hex);
    // this.debouncedChange(hex);
  }

  // private functions
  private debouncedChange(value: string) {
    this.dispatchEvent(new CustomEvent<ChangeEvent>("change", { detail: { value } }))
  }
  private setColor(value: string) {
    // Color.init();
    // try {
    //   const [r, g, b] = Color.cssToRGB(value);
    //   const hsl = Color.rgbToHSL(r, g, b);

    //   this.colorpicker_element.setColor(hsl);
    // }
    // catch {
    //   throw new Error('invalid color');
    // }
  }

  render() {
    return html`
      <pap-popover-template 
        hideonoutsideclick="true"
        revealby="click" 
        placement="bottom-right"
      >
        <doc-input slot="target" value="${this.value}" @change=${this.handleinputchange} label="${this.label}" placeholder="Choose a color"></doc-input>
        <color-picker @change=${this.handlecolorchange}></color-picker>
      </pap-popover-template>
    `
  }
}