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

    // public functions
    public get value () {
        return this.current?.getvalue();
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
                    }
                }
            })
        }
    }
    private handleitemselected = (e:Event) => {
        if (e.target instanceof MenuItem)
        {
            if (this.current)
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
                <o-button slot="target" size="large">
                    <slot slot="prefix" name="prefix"></slot>
                    <slot name="header-content"></slot>
                    <o-icon customSize="15" slot="suffix" name="caret">v</o-icon>
                </o-button>
                <o-box-template class="options" radius="small" elevation="small">
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