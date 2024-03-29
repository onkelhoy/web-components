PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and the types can you give me the following tables.

1. properties (columns: name, default-value, type, description)
2. events (columns: name - ex: 'click', type - ex: CustomEvent<ClickEvent>, description - when its being triggered etc)
3.public functions (columns: name, arguments - ex: arg1:CustomType, arg2?: boolean = true, arg3?: string, description - breif explenation what it does)

## SOURCE-CODE

 // utils
import { html, property, query } from "@pap-it/system-utils";

// templates
import { Base } from "@pap-it/system-base";

// local
import { style } from "./style";
import { State, Variant } from "./types";

export class Popup extends Base {
  static style = style;

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
    super.attributeChangedCallback(name,_old, value);

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
        <pap-card .headerTitle=${this.headerTitle} header footer>
          <pap-button
            @click=${this.hide}
            slot="header"
            variant="square"
            size="small"
          >
            <pap-icon-close size="small"></pap-icon-close>
          </pap-button>
          <slot></slot>
          <slot name="footer" slot="footer"></slot>
        </pap-card>
      </div>
    `;
  }
}

declare global {
    interface HTMLElementTagNameMap {
        "pap-popup": Popup;
    }
}

## TYPE-CODE: export type State = 'show' | 'hide'

export type Variant = 'global' | 'parent';
