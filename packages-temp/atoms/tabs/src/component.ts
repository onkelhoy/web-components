// utils 
import { html, property, query, CustomElement, debounce, bind } from "@papit/core";

// templates : visuals
import "@papit/prefix-suffix";

// local 
import { style } from "./style";
import { TabsTrigger } from "./components/tabs-trigger";
import { TabsContent } from "./components/tabs-content";

export class Tabs extends CustomElement {
  static style = style;

  private tabs: TabsTrigger[] = [];
  private contents: TabsContent[] = [];
  private currentlyscrolling: boolean = false;
  private scrollclick = false;
  private internalclick = false;

  // elements 
  @query('span[part="indicator"]') indicatorElement!: HTMLSpanElement;
  @query('div[part="header-tabs"]') headerElement!: HTMLElement;
  @query('main') mainElement!: HTMLElement;

  @property({
    after: function (this: Tabs) {
      if (!this.internalselect) {
        this.dispatchEvent(new Event('pre-change'));
      }
      this.internalselect = false;
    }
  }) selected?: string;
  @property({ type: Boolean }) indicator: boolean = true;
  @property({ type: Boolean }) scrolling: boolean = false;

  private internalselect = false;
  public selected_id?: string;

  // event handlers
  @bind
  private handleslotchange(e: Event) {
    if (e.target instanceof HTMLSlotElement) {
      let selected: string | null = null;
      let firsttab: string | null = null;

      const elements = e.target.assignedElements();

      elements.forEach((element, index) => {
        if (!element.hasAttribute('data-tabs-pass')) {
          const isContent = element instanceof TabsContent;
          const isTab = element instanceof TabsTrigger;

          let id = "";
          if (isContent) {
            id = this.contents.length.toString();
            this.contents.push(element);
          }
          if (isTab) {
            id = this.tabs.length.toString();
            if (!firsttab) {
              firsttab = id;
            }
            if (!selected && (String(index) === this.selected || (element.id && element.id === this.selected))) {
              selected = id;
            }
            element.addEventListener('click', this.handletabclick);
            this.tabs.push(element);
          }

          // we want to make sure our system has reference id 
          // if (element.hasAttribute('id')) {
          //   id = element.getAttribute('id') as string;
          // }

          if (isContent || isTab) {
            element.init(this);
            element.setAttribute('data-tab-id', id);
            element.setAttribute('data-tabs-pass', 'true');
          }
        }
      });

      // NOTE remember that this method could be called after tabs have been init (so we check value exists)
      if (selected !== null) {
        this.initselect(selected)
      }
      else if (firsttab !== null) {
        this.initselect(firsttab)
      }
    }
  }
  @bind
  private handletabclick(e: Event) {
    if (e.target instanceof TabsTrigger) {
      if (!this.scrollclick) {
        this.internalclick = true;
      }

      const referenceid = e.target.getAttribute('data-tab-id') as string
      let id = referenceid;
      if (e.target.hasAttribute('id')) {
        id = e.target.getAttribute('id') as string;
      }
      this.internalselect = true;
      this.selected = id;
      this.selected_id = referenceid;
      this.dispatchEvent(new Event('change'));

      if (this.headerElement) {
        const SX = e.target.offsetLeft - this.headerElement.offsetLeft;
        const SXE = SX + e.target.clientWidth;

        // check if the current view can show it (so we dont do unecessary scrolls)
        if (SXE > this.headerElement.scrollLeft + this.headerElement.clientWidth || SX < this.headerElement.scrollLeft) {
          this.headerElement.scrollTo({
            left: SX,
            behavior: "smooth"
          })
        }
        if (this.indicator && this.indicatorElement) {
          this.indicatorElement.style.left = SX + "px";
          this.indicatorElement.style.width = e.target.clientWidth + "px";
        }
      }


      if (this.scrolling && this.mainElement && !this.currentlyscrolling) {
        const content = this.contents.find(c => {
          if (c.getAttribute('id') === id) return true;
          if (c.getAttribute('data-tab-id') === referenceid) return true;
          return false;
        });
        if (content) {
          this.mainElement.scrollTo({
            top: content.offsetTop - this.mainElement.offsetTop,
            behavior: 'smooth'
          })
        }
      }
    }
  }

  @bind
  private handlescroll(e: Event) {
    if (this.scrolling && this.mainElement) {
      this.currentlyscrolling = true;
      const ST = this.mainElement.scrollTop;
      let accumulated = 0;
      for (let i = 0; i < this.contents.length; i++) {
        accumulated += this.contents[i].clientHeight;
        if (ST < accumulated) {
          if (!this.tabs[i].classList.contains('selected')) {
            this.scrollclick = true;
            if (!this.internalclick) this.tabs[i].click()
          }
          break;
        }
      }
    }
  }
  @bind
  private handlescrollend(e: Event) {
    this.currentlyscrolling = false;
    this.internalclick = false;
    this.scrollclick = false;
  }

  // helper function
  @debounce
  @bind
  private initselect(id: string) {
    if (this.selected === undefined) {
      this.selected = id;
    }

    this.dispatchEvent(new Event('pre-change'));
  }

  render() {
    return html`
      <header part="header">
        <slot name="header-top"></slot>
        <pap-prefix-suffix>
          <slot slot="prefix" name="header-prefix"></slot>
          <div part="header-tabs">
            <slot @slotchange="${this.handleslotchange}" name="tab"></slot>
            <span part="indicator"></span>
          </div>
          <slot slot="suffix" name="header-suffix"></slot>
        </pap-prefix-suffix>
        <slot name="header-below"></slot>
      </header>
      <slot name="between"></slot>
      <main @scroll="${this.handlescroll}" @scrollend="${this.handlescrollend}" part="content">
        <slot @slotchange="${this.handleslotchange}" name="content"></slot>
      </main>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-tabs": Tabs;
  }
}