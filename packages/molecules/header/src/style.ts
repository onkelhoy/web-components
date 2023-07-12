export const style = `:host,
:host > div {
  display: flex;
  align-items: center;
  gap: 1rem; }

:host {
  justify-content: space-between; }
  :host o-menu::part(box) {
    min-width: 15rem; }
  :host div.icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--icon-container-size);
    height: var(--icon-container-size); }

img.avatar {
  width: var(--icon-container-size);
  height: var(--icon-container-size);
  border-radius: 50%; }

@media (prefers-color-scheme: light) {
  :host o-icon[name="dark-mode"] {
    display: none; } }

@media (prefers-color-scheme: dark) {
  :host o-icon[name="light-mode"] {
    display: none; } }

:host(.dark-mode) o-icon[name="light-mode"] {
  display: none; }

:host(.dark-mode) o-icon[name="dark-mode"] {
  display: initial; }

:host(.light-mode) o-icon[name="dark-mode"] {
  display: none; }

:host(.light-mode) o-icon[name="light-mode"] {
  display: initial; }`;
