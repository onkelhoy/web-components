// import statements 
// system 
import { CustomElement, html, property, Radius, RenderType } from "@papit/core";

// local 
import { style } from "./style";
import { Placement, Mode, Elevation, ElevationDirection } from "./types";

export class Aside extends CustomElement {
  static style = style;

  @property({ rerender: false, type: Boolean }) backdrop: boolean = true;
  @property({ rerender: false, type: Boolean }) hideonoutsideclick: boolean = true;
  @property({
    type: Boolean,
    after: function (this: Aside) {
      this.opened = performance.now();
    }
  }) open: boolean = false;
  @property({ rerender: false }) placement: Placement = "right";
  @property({ rerender: false }) radius: Radius = "medium";
  @property({ rerender: false }) elevation: Elevation = "none";
  @property({ rerender: false, attribute: 'elevation-direction' }) elevationdirection: ElevationDirection = "vertical";
  @property({ rerender: false }) mode: Mode = "normal";
  @property({
    rerender: false,
    after: function (this: Aside) {
      if (this.hasrendered) {
        if (this.width) {
          let value = this.width;
          // check for number -> then we treat as pixel
          if (!Number.isNaN(Number(value))) {
            value += "px";
          }
          this.style.setProperty('--aside-width', value);
        }
        else {
          this.style.removeProperty('--aside-width');
        }
      }
    }
  }) width?: string;

  private opened = 0;
  private inside = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this.handlewindowclick);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("click", this.handlewindowclick);
  }

  // event handlers
  private handlewindowclick = () => {
    const now = performance.now();

    if (!this.inside && this.hideonoutsideclick && now - this.opened > 200) {
      this.hide();
    }

    // always reset inside
    this.inside = false;
  }
  private handlewrapperclick = () => {
    // so window click wont close (if hideonoutsideclick)
    this.inside = true;
  }

  // public functions 
  public hide() {
    this.open = false;
    this.dispatchEvent(new Event('hide'));
  }
  public show() {
    this.open = true;
    this.dispatchEvent(new Event('show'));
  }

  render(content?: RenderType) {
    return html`
      <div 
        radius="${this.radius}" 
        elevation="${this.elevation}"
        elevationdirection="${this.elevationdirection}"
        part="wrapper" 
        @click="${this.handlewrapperclick}"
      >
        <div part="accordion">
          <div part="group">
            <div part="content">
              ${content}
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-aside": Aside;
  }
}