PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and style code probided. Can you create a documentation that includes titles, short descrition and the table for each tables: css-variables, parts, slots.
css-variables should be a table with columns: (name, default-value, type - ex. CSS unit, description).
parts should include all elements that have been exposed with the part attribute ex: <p part='foo'> - and the table should then include columns: (name, description (short)).
slots should include columns: (name, default-value, description)

## SOURCE-CODE:
// utils 
import { html, property } from "@circular-tools/utils";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";
import { load, loadAll, change, subscribe, unsubscribe } from "./translator";

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
        if (typeof value === 'string') {
        this.key = value.replace(/<!--\?lit.*?>(.*)/, '$1');
        } else this.key = '';
    
        this.updateText();
    }
    private dynamicAttributes:Set<string> = new Set<string>();

    // class functions 
    connectedCallback(): void {
        super.connectedCallback();

        window.oTranslation = window.oTranslation || {};
        window.oTranslation.load = window.oTranslation.load || load;
        window.oTranslation.change = window.oTranslation.change || change;
        window.oTranslation.loadAll = window.oTranslation.loadAll || loadAll;
        window.oTranslation.subscribe = window.oTranslation.subscribe || subscribe;
        window.oTranslation.unsubscribe = window.oTranslation.unsubscribe || unsubscribe;
        window.oTranslation.current = window.oTranslation.current || {};
        window.oTranslation.map = window.oTranslation.map || new Map();

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

## STYLE-CODE:
:host {
  padding: auto;
}