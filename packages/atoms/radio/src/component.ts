// utils 
import { html, property } from "@circular-tools/utils";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";
import { Foo, ClickEvent } from "./types";

export class Radio extends BaseTemplate {
    static style = style;

    @property() foo:Foo = "bar";
    @property({ type: Number }) bajs?:number;
    @property({ type: Boolean }) fooLaa:boolean = true;

    // event handlers
    private handleMainClick() {
        this.dispatchEvent(new CustomEvent<ClickEvent>("main-click", { detail: { foo: this.foo } }));
    }

    render() {
        return html`
            <header part="header">
                <slot name="header">
                    <h1>llama drama trauma</h1>
                </slot>
            </header>
            <main onclick=${this.handleMainClick}>
                <slot>
                    <p>Why did the llama go to therapy? Because it had a lot of spitting issues!</p>
                </slot>
            </main>
            <footer part="footer">
                <slot name="footer">
                    <p>Why did the llama enter the door? To attend the llamazing party inside!</p>
                </slot>
            </footer>
        `
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "o-radio": Radio;
    }
}