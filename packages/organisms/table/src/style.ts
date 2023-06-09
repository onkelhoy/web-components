export const style = `:host {
  display: block;
  --table-row-color: var(--table-row-color-light, var(--color-neutral-200, #FFF));
  --table-background-color: var(--table-background-color-light, var(--color-neutral-100, #F8F8F8));
  --table-border-color: var(--table-border-color-light, var(--color-neutral-600, #A6ADBA)); }
  :host table {
    background-color: var(--table-background-color);
    width: 100%; }
    :host table tr th:not(:last-child) {
      position: relative; }
      :host table tr th:not(:last-child)::after {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        content: '';
        pointer-events: none;
        width: 1px;
        background-color: var(--table-border-color); }
    :host table tr td:not(:last-child) {
      border-right: 1px solid var(--table-border-color); }
    :host table tr:not(:first-child):nth-child(2n + 1) {
      background-color: var(--table-row-color); }
  :host footer {
    margin-top: var(--margin-small, 8px); }

@media (prefers-color-scheme: dark) {
  :host {
    --background: var(--table-dark-background-color, var(--colors-netural-black, black));
    --color: var(--table-dark-text-color, var(--colors-netural-white, white)); } }`;
