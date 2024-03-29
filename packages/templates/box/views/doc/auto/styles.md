PRE: just start the task given, dont include any starting lines so I can just copy your answer as it is!
 Based on the source code and style code probided. Can you create a documentation that includes titles, short descrition and the table for each tables: css-variables, parts, slots.
css-variables should be a table with columns: (name, default-value, type - ex. CSS unit, description).
parts should include all elements that have been exposed with the part attribute ex: <p part='foo'> - and the table should then include columns: (name, description (short)).
slots should include columns: (name, default-value, description)

## SOURCE-CODE

// utils
import { property } from "@pap-it/system-utils";

// templates
import { Base, RenderType } from "@pap-it/system-base";

// local
import { style } from "./style";
import { Elevation, Radius } from "./types";

export class Box extends Base {
    static styles = [style];

    @property({ rerender: false }) radius: Radius = "circular";
    @property({ rerender: false }) elevation: Elevation = "none";

    render():RenderType {
        return `
            <slot></slot>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "pap-box-template": Box;
    }
}

## STYLE-CODE

:host {
    --shadow-color: var(--pap-box-shadow-color-light, var(--pap-color-shadow-500));
}

@media (prefers-color-scheme: dark) {
    :host {
        --shadow-color: var(--pap-box-shadow-color-dark, var(--pap-color-shadow-500));
    }
}

$radius-map: (
    none: 0px,
    small: var(--radius-small, 4px),
    medium: var(--radius-medium, 8px),
    large: var(--radius-large, 16px),
    circular: var(--radius-max, 1000px),
);

$elevation-map: (
    none: none,
    small: 0 2px 4px var(--shadow-color),
    medium: 4px 0px 32px 0px var(--shadow-color), // from navbar design
    large: 0 2px 15px 5px var(--shadow-color),
);

@each $name, $value in $radius-map {
    :host([radius="#{$name}"]) {
        border-radius: var(--box-radius-#{$name}, var(--radius-#{$name}, $value));
    }
}

@each $name, $value in $elevation-map {
    :host([elevation="#{$name}"]) {
        box-shadow: var(--box-shadow-#{$name}, var(--shadow-#{$name}, $value));
    }
}
