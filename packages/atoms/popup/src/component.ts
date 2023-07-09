// utils 
import { html, property, query } from "@circular-tools/utils";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";
import { State, Variant } from "./types";

export class Popup extends BaseTemplate {
  static styles = style;

  @query('iz-card') private cardElement!: HTMLDivElement;

  @property({ type: String }) headerTitle = 'Popup Title';

  @property({ type: Boolean }) hideonoutsideclick: boolean = false;

  @property() variant: Variant = 'global';

  @property() state: State = 'hide';

  // @property() minWidth?: string;

  private showDelay = false;

  private documentElementOverflow: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('variant'))
      this.setAttribute('variant', this.variant);

    if (this.hideonoutsideclick) {
      window.addEventListener('click', this.handleOutsideClick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.hideonoutsideclick) {
      window.removeEventListener('click', this.handleOutsideClick);
    }
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback(name, _old, value);

    if (name === 'state') {
      if (value === 'show') {
        this.show();
      } else {
        this.hide();
      }
    }

    if (name === 'minwidth' && value !== null) {
      // TODO should this be implemented ?
      // console.log("minWidth",value)
      // this.style["--card-width"] = value;
    }
  }

  // public functions
  public show() {
    this.state = 'show';
    this.showDelay = true;

    if (this.variant === 'global') {
      if (!this.documentElementOverflow) {
        const computedStyle = window.getComputedStyle(document.documentElement);
        this.documentElementOverflow =
          computedStyle.getPropertyValue('overflow');
      }
      document.documentElement.style.overflow = 'hidden';
    }

    setTimeout(() => {
      this.showDelay = false;
      this.dispatchEvent(new Event('popup-show'));
    }, 2);
  }

  public hide = () => {
    if (this.variant === 'global') {
      document.documentElement.style.overflow =
        this.documentElementOverflow || 'auto';
    }
    this.state = 'hide';
    this.dispatchEvent(new Event('popup-hide'));
  };

  // private functions
  private handleOutsideClick = (event: MouseEvent) => {
    if (!this.hideonoutsideclick) return;
    if (this.state === 'hide') return;
    if (this.showDelay) return;

    const cardBox = this.cardElement?.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;

    if (cardBox instanceof DOMRect) {
      if (Popup.mouseWithin(x, y, cardBox)) return;
    }

    this.hide();
  };

  static mouseWithin(x: number, y: number, rec: DOMRect) {
    return rec.left <= x && rec.right >= x && rec.top <= y && rec.bottom >= y;
  }

  render() {
    return html`
      <div class=${['wrapper', this.state, this.variant].join(' ')}>
        <o-card .headerTitle=${this.headerTitle} header footer>
          <o-button
            @click=${this.hide}
            slot="header"
            variant="square"
            size="small"
          >
            <o-icon-close size="small"></o-icon-close>
          </o-button>
          <slot></slot>
          <slot name="footer" slot="footer"></slot>
        </o-card>
      </div>
    `;
  }
}

declare global {
    interface HTMLElementTagNameMap {
        "o-popup": Popup;
    }
}