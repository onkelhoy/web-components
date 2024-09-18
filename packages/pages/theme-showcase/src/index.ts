import { PageThemeShowcase } from './component.js';
// import "./components/color-card";
// import "./components/animations";
// import "./components/colors";
// import "./components/units";

// export 
export * from "./component";
export * from "./types";

export * from "./components/color-card";
export * from "./components/animations";
export * from "./components/colors";
export * from "./components/units";

// Register the element with the browser

if (!window.customElements) {
  throw new Error('Custom Elements not supported');
}

if (!window.customElements.get('theme-showcase')) {
  window.customElements.define('theme-showcase', PageThemeShowcase);
}
