// utils 
import { html, property } from "@circular-tools/utils";

// atoms
import "@circular/icon/wc";
import "@circular/button/wc";

// templates
import { BaseTemplate } from "@circular-templates/base";
import { Placement } from "@circular-templates/popover";
import "@circular-templates/popover/wc";
import "@circular-templates/box/wc";

// local 
import { style } from "./style";
import { MenuItem } from "./components/menu-item";

export class Menu extends BaseTemplate {
    static style = style;

    @property({ rerender: false, type: Boolean }) open: boolean = false;
    @property() placement: Placement = "bottom-center";

    private current?: MenuItem;
    private items: MenuItem[] = [];

    // public functions
    public get value () {
        return this.current?.getvalue() || '';
    }
    public set value (value:string) {
        const item = this.items.find(i => i.getvalue() === value);
        if (item)
        {
            item.click();
        }
    }
    public get text () {
        return this.current?.gettext();
    }

    // event handlers
    private handleslotchange = (e:Event) => {
        if (e.target instanceof HTMLSlotElement)
        {
            const items = e.target.assignedElements();
            items.forEach(item => {
                if (item instanceof MenuItem)
                {
                    if (!item.hasAttribute('data-menu-init'))
                    {
                        item.addEventListener('select', this.handleitemselected);
                        item.setAttribute('data-menu-init', 'true');
                        this.items.push(item);
                    }
                }
            })
        }
    }
    private handleitemselected = (e:Event) => {
        if (e.target instanceof MenuItem)
        {
            if (this.current && e.target !== this.current)
            {
                this.current.checked = false;
            }
            this.current = e.target;
            this.dispatchEvent(new Event('select'));
        }
    }
    private handlehide = () => {
        this.open = false;
    }
    private handleshow = () => {
        this.open = true;
    }

    render() {
        return html`
            <o-popover-template @hide="${this.handlehide}" @show="${this.handleshow}" revealby="click" hideonoutsideclick placement="${this.placement}">
                <o-button part="button" slot="target" size="large">
                    <slot name="button-prefix" slot="prefix"></slot>
                    <slot name="button-content"></slot>
                    <slot name="button-suffix" slot="suffix">
                        <span class="caret-wrapper">
                            <o-icon customSize="15" name="caret">v</o-icon>
                        </span>
                    </slot>
                </o-button>
                <o-box-template part="box" class="options" radius="small" elevation="small">
                    <slot @slotchange="${this.handleslotchange}">
                        <o-menu-item>Missing Items</o-menu-item>
                    </slot>
                </o-box-template>
            </o-popover-template>
        `
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "o-menu": Menu;
    }
}