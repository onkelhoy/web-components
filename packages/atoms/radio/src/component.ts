// utils 
import { html, property } from "@circular-tools/utils";

// templates
import { FieldTemplate } from "@circular-templates/field";

// local 
import { style } from "./style";
import { Foo, ClickEvent } from "./types";

export class Radio extends FieldTemplate {
    static style = style;

    // @property({ rerender: false }) checked

    constructor() {
        super();

        this.addEventListener("click", this.handleclick);
    }

    // event handlers 
    private handleclick = () => {

    }

    render() {
        return super.render(html`
            <div class="radio">
                <slot name="prefix"></slot>
                <span part="indicator"></span>
                <slot name="suffix"></slot>
            </div>
            <input type="radio" hidden readonly />
        `)
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "o-radio": Radio;
    }
}