// utils 
import { html, property, query } from "@circular-tools/utils";
import "@circular-tools/translator/wc";

// atoms
import "@circular/badge/wc";
import "@circular/typography/wc";
import "@circular/menu/wc";
import { Menu } from "@circular/menu";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";
import { UserModel } from "./types";

export class Header extends BaseTemplate {
    static style = style;

    @property({ type: Object }) user?: UserModel;

    // event handlers 
    
    private handleuserselect = (e:Event) => {
        if (e.target instanceof Menu)
        {
            this.classList.remove('light-mode', 'dark-mode');
            if (e.target.value !== "auto") 
            {
                this.classList.add(`${e.target.value}-mode`);
            }
        }
    }

    render() {
        const avatarlink = this.user?.avatar || `public/images/avatar${Math.round(Math.random() * 4) + 1}.png`
        return html`
            <div class="prefix">
                <slot name="prefix"></slot>
            </div>
            <div class="center">
                <slot></slot>
            </div>
            <div class="suffix">
                <o-language></o-language>
                <o-menu placement="bottom-left" @select="${this.handleuserselect}">
                    <div class="icon-wrapper" slot="button-content">
                        <o-icon name="light-mode"></o-icon>
                        <o-icon name="dark-mode"></o-icon>
                    </div>

                    <o-menu-item value="dark">
                        <o-typography><o-translator>Dark Mode</o-translator></o-typography>
                    </o-menu-item>
                    <o-menu-item value="light">
                        <o-typography><o-translator>Light Mode</o-translator></o-typography>
                    </o-menu-item>
                    <o-menu-item value="auto">
                        <o-typography><o-translator>Auto Mode</o-translator></o-typography>
                    </o-menu-item>
                </o-menu>
                <o-menu placement="bottom-left" @select="${this.handleuserselect}">
                    <img slot="button-prefix" src="${avatarlink}" alt="${this.user?.firstname || "no-name"} profile picture" />
                    <o-typography slot="button">${this.user?.firstname || "no-name"}</o-typography>

                    <o-menu-item value="settings">
                        <o-typography><o-translator>User Settings</o-translator></o-typography>
                    </o-menu-item>
                    <o-menu-item value="logout">
                        <o-typography><o-translator>Logout</o-translator></o-typography>
                    </o-menu-item>
                </o-menu>
            </div>
            
        `
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "o-header": Header;
    }
}