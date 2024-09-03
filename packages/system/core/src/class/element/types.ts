// import { PropertyInfo } from "../property";

export type FunctionCallback = { callback: Function, args: any[] };
export type RenderType = DocumentFragment | string | undefined | string[] | DocumentFragment[];

export type Setting = ShadowRootInit & {
  updateInterval: number;
  attributeUpdateInterval: number;
  reactiveRendering: boolean;
  reactiveStyling: boolean;
  nofocus: boolean;
  noblur: boolean;
  noshadow: boolean;
}

export interface ICustomElement extends HTMLElement {
  shadowRoot: ShadowRoot | null;
  rendercomperator: HTMLTemplateElement;
  stylecomperator: HTMLStyleElement;
  lastrender: Document;
  domparser: DOMParser;

  // functions 
  getStyle(): string;
  render(): RenderType;
}