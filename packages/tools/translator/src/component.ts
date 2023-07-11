// utils 
import { html } from "@circular-tools/utils";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";
import { InitTranslations } from "./translator";

export class Translator extends BaseTemplate {
    static style = style;

    private spanElement!: HTMLSpanElement;
    private text!: string;
    get Text() {
        return this.text;
    }
    private key!: string;
    get Key() {
        return this.key;
    }
    set Key(value: string | null) {
        if (typeof value === 'string') 
        {
            this.key = value.replace(/<!--\?lit.*?>(.*)/, '$1');
        } 
        else 
        {
            this.key = '';
        }
    
        this.updateText();
    }
    private dynamicAttributes:Set<string> = new Set<string>();

    // class functions 
    connectedCallback(): void {
        super.connectedCallback();
        InitTranslations();
        window.oTranslation?.subscribe(this.updateText);
    }
  
    disconnectedCallback() {
        super.disconnectedCallback();
        // this.attributeObserver.disconnect();
        window.oTranslation?.unsubscribe(this.updateText);
    }

    attributeChangedCallback(name:string, oldValue:string|null, newValue:string|null) {
        if (this.dynamicAttributes.has(name))
        {
            this.updateText();
        }
    }

    firstUpdate(): void {
        if (this.shadowRoot)
        {
            const span = this.shadowRoot.querySelector<HTMLSpanElement>('span.o-translation-span');
            if (span)
            {
                this.spanElement = span;
            }
        }
    }

    // event handlers 
    private handletranslateslotchange = (e:Event) => {
        if (e.target instanceof HTMLSlotElement)
        {
            const nodetext = e.target.assignedNodes()?.[0]?.textContent;
            this.Key = nodetext;
        }
    }

    // public functions 
    public translateKey(key:string) {
        if (this.key !== key)
        {
            this.Key = key;
        }

        return this.text;
    }

    // private functions 
    private updateText = () => {
        let text = window.oTranslation?.current?.translations?.[this.key] || this.key;
        if (text === undefined && this.key === undefined) return;

        const regex = /{([^{}]+)}/g;
        const matches = text.match(regex);

        if (matches) 
        {
            matches.forEach(variable => {
                const sliced = variable.slice(1, -1);
                const value = this.getAttribute(sliced);
                if (value) 
                {
                    text = text.replace(variable, value);

                    if (!this.dynamicAttributes.has(sliced))
                    {
                        this.dynamicAttributes.add(sliced);
                    }
                }
            });
        }

        this.text = text;
        if (this.spanElement)
        {
            this.spanElement.innerText = text;
        }
        else 
        {
            this.requestUpdate();
        }
    };

    render() {
        return html`
            <span class="o-translation-span"></span>
            <slot style="display:none;" @slotchange="${this.handletranslateslotchange}"></slot>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "o-translator": Translator;
    }
}