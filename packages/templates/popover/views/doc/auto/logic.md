PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and the types can you give me the following tables.

1. properties (columns: name, default-value, type, description)
2. events (columns: name - ex: 'click', type - ex: CustomEvent<ClickEvent>, description - when its being triggered etc)
3.public functions (columns: name, arguments - ex: arg1:CustomType, arg2?: boolean = true, arg3?: string, description - breif explenation what it does)

## SOURCE-CODE

 // utils
import { html, property } from "@pap-it/system-utils";

// templates
import { Base } from "@pap-it/system-base";

import { style } from "./style";
import { Reveal, Placement } from './types';

export class Popover extends Base {
  static styles = [style];

  @property() revealby: Reveal = 'hover';
  @property() placement: Placement = 'bottom-center';
  @property({ type: Boolean }) hideonoutsideclick: boolean = true;
  @property({ type: Boolean }) open: boolean = false;

  private outside = false;

  // class functions
  constructor() {
    super();

    this.addEventListener('mouseenter', this.handlemouseenter);
    this.addEventListener('mouseleave', this.handlemouseleave);
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("click", this.handlewindowclick);
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("click", this.handlewindowclick);
  }

  // event handlers
  private handlemouseenter = () => {
    this.outside = false;

    if (this.revealby === "hover")
    {
      this.show();
    }
  }
  private handlemouseleave = () => {
    this.outside = true;

    if (this.revealby === "hover")
    {
      this.hide();
    }
  }
  private handlemousedown = () => {
    if (this.revealby === "click")
    {
      this.show();
    }
  }
  private handlewindowclick = (e:Event) => {
    if (this.hideonoutsideclick && this.outside && this.revealby === "click")
    {
      this.hide();
    }
  }

  // public functions
  public show() {
    this.dispatchEvent(new Event('show'));
    this.open = true;
  }
  public hide() {
    this.dispatchEvent(new Event('hide'));
    this.open = false;
  }

  render() {
    return html`
      <div
        class="target"
        part="target"
        @mousedown="${this.handlemousedown}"
      >
        <slot name="target"></slot>
      </div>
      <div class="wrapper" part="wrapper">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
      "pap-popover-template": Popover;
  }
}

## TYPE-CODE: // NOTE these are just for example purposes

type TB = 'top' | 'bottom';
type LR = 'left' | 'right';

export type Reveal = 'hover' | 'click';
export type Placement = `${TB}-${LR | 'center'}` | `${LR}-${TB | 'center'}`;
