// system
import { debounce, html, property, query, CustomElement, bind } from "@papit/core";

import { style } from "./style";
import { Reveal, Placement, PlacementInfo, TBLR, OPPOSITE, ROTATED, Scores, PLACEMENTS, TBLRC } from './types';

export class PopoverProperties extends CustomElement {
  @property({ rerender: true }) revealby: Reveal = 'hover';
  @property({
    after: function (this: PopoverProperties) {
      if (!this.internal) {
        this.originalplacement = this.placement;
      }
      this.internal = false;

      this.reposition();
    }
  }) placement: Placement = 'bottom-center';
  @property({ type: Boolean, rerender: true }) hideonoutsideclick: boolean = true;
  @property({
    type: Boolean,
    removeAttribute: false,
    before: function (this: Popover) {
      this.reposition();
    },
    after: function (this: Popover) {
      if (!this.internal) {
        this.requestUpdate();
      }
      this.internal = false;
    }
  }) open: boolean = false;

  protected originalplacement!: Placement;
  protected internal: boolean = false;
  protected reposition() { }
}

export class Popover extends PopoverProperties {
  static styles = [style];
  private outside = false;
  private isobserving = false;
  private observer: IntersectionObserver | null = null;

  @query<HTMLDivElement>('div[part="target"]') targetelement!: HTMLDivElement;
  @query<HTMLDivElement>({
    selector: 'div[part="wrapper"]',
    load: function(this:Popover, element) {
      if (this.observer && !this.isobserving)
      {
        this.observer.observe(element);
      }
    }
  }) wrapperelement!: HTMLDivElement;

  // class functions
  constructor() {
    super();

    this.addEventListener('mouseenter', this.handlemouseenter, { passive: true });
    this.addEventListener('mouseleave', this.handlemouseleave, { passive: true });
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("click", this.handlewindowclick);

    // Set up the IntersectionObserver to observe the target element
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting)
        {
          this.reposition();  // Trigger reposition when the target is in view
        }
      });
    }, {
      root: null, // Viewport
      threshold: [0, 1], // Trigger when any part of the element is in view or fully in view
    });

    // Observe the target element
    if (this.wrapperelement) {
      this.observer.observe(this.wrapperelement);
    }
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("click", this.handlewindowclick);

    // Disconnect the IntersectionObserver when the component is removed
    if (this.observer && this.wrapperelement) {
      this.observer.unobserve(this.wrapperelement);
    }
  }

  // event handlers
  @bind
  private handlemouseenter () {
    this.outside = false;

    if (this.revealby === "hover") {
      this.show();
    }
  }
  @bind
  private handlemouseleave () {
    this.outside = true;

    if (this.revealby === "hover") {
      this.hide();
    }
  }
  @bind
  private handlemousedown () {
    if (this.revealby === "click") {
      this.show();
    }
  }
  @bind
  private handlewindowclick (e: Event) {
    if (this.hideonoutsideclick && this.outside && this.revealby === "click") {
      this.hide();
    }
  }

  // private functions
  @debounce(100)
  override reposition() {
    if (!this.wrapperelement) return;

    const box = this.targetelement.getBoundingClientRect();
    const info: PlacementInfo = {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      w: this.wrapperelement.clientWidth,
      h: this.wrapperelement.clientHeight,
    };


    const omits = this.omits(info);
    const scores: Scores = {};

    const potentials = this.potentials();

    for (let potential of potentials) {
      const [left, right] = potential.split('-');

      if (omits[left as TBLR]) {
        scores[potential] = 0;
        continue;
      }

      const [x, y] = this.pos(info, left as TBLR, right as TBLRC);
      const iarea = this.area(x, y, info.w, info.h);
      const area = info.w * info.h;

      const score = iarea / area;
      scores[potential] = score;
      if (score === 1) {
        this.internal = true;
        this.placement = potential;
        return;
      }
    }

    let maxcase = {
      name: this.originalplacement,
      score: 0,
    };
    for (let potential in scores) {
      const score = scores[potential as Placement] as number;

      if (score > maxcase.score) {
        maxcase.score = score;
        maxcase.name = potential as Placement;
      }
    }

    if (maxcase.score !== 0) {
      this.internal = true;
      this.placement = maxcase.name;
    }
  }

  private pos(info: PlacementInfo, left: TBLR, right: TBLRC): number[] {
    let x = 0, y = 0;
    if (["left", "right"].includes(left)) {
      // fix the left case (x)
      if (left === "left") {
        x = info.x - info.w;
      }
      else if (left === "right") {
        x = info.x + info.width;
      }

      // fix the right case (y)
      if (right === "top") {
        y = info.y;
      }
      else if (right === "center") {
        y = info.y + info.height / 2 - info.h / 2;
      }
      else if (right === "bottom") {
        y = info.y + info.height - info.h;
      }
    }
    else {
      // fix the left case (x)
      if (left === "top") {
        y = info.y - info.h;
      }
      else if (left === "bottom") {
        y = info.y + info.height;
      }

      // fix the right case (y)
      if (right === "left") {
        x = info.x;
      }
      else if (right === "center") {
        x = info.x + info.width / 2 - info.w / 2;
      }
      else if (right === "right") {
        x = info.x + info.width - info.w;
      }
    }

    return [x, y];
  }
  private omits(info: PlacementInfo): Record<TBLR, boolean> {
    const omits = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };
    if (info.y - info.h < 0) {
      // we can omit all top cases
      omits.top = true;
    }
    if (info.y + info.height + info.h > window.innerHeight) {
      // we can omit all bottom cases
      omits.bottom = true;
    }
    if (info.x - info.w < 0) {
      // we can omit all left cases
      omits.left = true;
    }
    if (info.x + info.width + info.w > window.innerWidth) {
      // we can omit all right cases
      omits.right = true;
    }

    return omits;
  }
  private potentials(): Placement[] {
    const [left, right] = this.originalplacement.split('-');

    const potentials = this.potentialrightspread(left, right)
      .concat(this.potentialrightspread(OPPOSITE[left as TBLR], right))
      .concat(this.potentialrightspread(ROTATED[left as TBLR], OPPOSITE[right as TBLRC]))
      .concat(this.potentialrightspread(OPPOSITE[ROTATED[left as TBLR]], OPPOSITE[right as TBLRC]));

    return potentials;
  }
  // it just maps the right to either top,center,bottom or left,center,right
  private potentialrightspread(a: string, b: string) {
    const casea = ROTATED[a as TBLR];
    const caseb = OPPOSITE[casea];

    const first = `${a}-${casea}`;
    const center = `${a}-center`;
    const last = `${a}-${caseb}`;

    if (b === "center") {
      return [center, first, last] as Placement[];
    }

    if (["right", "bottom"].includes(b)) {
      return [last, center, first] as Placement[];
    }

    return [first, center, last] as Placement[];
  }

  private area(x: number, y: number, w: number, h: number) {
    // Calculate the (x, y) coordinates of the intersection rectangle
    const L = Math.max(x, 0);
    const R = Math.min(x + w, window.innerWidth);
    const T = Math.max(y, 0);
    const B = Math.min(y + h, window.innerHeight);

    if (R >= L && B >= T) {
      return (R - L) * (B - T);
    }
    return 0;
  }

  // public functions
  public show() {
    if (!this.open) {
      this.dispatchEvent(new Event('show'));
      this.open = true;
    }
  }
  public hide() {
    if (this.open) {
      this.dispatchEvent(new Event('hide'));
      this.open = false;
    }
  }

  render() {
    return html`
      <div
        part="target"
        @click="${this.handlemousedown}"
      >
        <slot name="target"></slot>
      </div>
      <div part="wrapper">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-popover": Popover;
  }
}