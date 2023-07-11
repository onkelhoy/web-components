export const style = `:host {
  --background: var(--o-color-white);
  --color: var(--o-color-black); }
  :host o-button {
    background-color: var(--background);
    color: var(--color);
    padding: var(--padding-small, 8px);
    gap: var(--padding-small, 8px); }
    :host o-button span.caret-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px; }
  :host o-popover-template {
    display: inline-block; }
  :host o-box-template {
    display: block;
    padding-block: var(--padding-small);
    min-width: 180px;
    background-color: var(--background);
    max-height: 20rem;
    overflow-y: auto; }

:host([open="true"]) o-button o-icon[name="caret"] {
  transform: rotate(180deg); }

:host([open="false"]) o-button o-icon[name="caret"] {
  transform: rotate(0); }`;
