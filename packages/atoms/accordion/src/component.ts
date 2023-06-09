// utils 
import { html, property } from "@circular-tools/utils";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";

export class Accordion extends BaseTemplate {
    static style = style;

    @property({ rerender: false, type: Boolean }) open = false;

    render() {
        return html`
            <div part="group">
                <slot></slot>
            </div>
        `
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "o-accordion": Accordion;
    }
}