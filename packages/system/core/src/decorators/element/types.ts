import { PropertyInfo } from "../property";

export type FunctionCallback = { callback: Function, args: any[] };
export type RenderType = DocumentFragment | string | undefined | string[] | DocumentFragment[];

export interface CustomElement extends HTMLElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, newValue: string | null, oldValue: string | null): void;
  firstRender?(): void;
  getProperties?(): Record<string, PropertyInfo>;
  addProperty?(info: PropertyInfo): void;
  requestUpdate?(): void;
  update?(): void;
  updateAttribute?(): void;
  initAttributes?(): void;
  render?(...args: any[]): RenderType;

  stylecomperator?: string;
  rendertemplate?: HTMLTemplateElement;

  // private functions 
  __updateAttribute?(): void;
  __requestUpdate?(): void;
  originalHTML?: string;
  hasFocus?: boolean;

  properties?: Record<string, PropertyInfo>;
  baseConstructor?: Constructor;
  callAfterRender?: (Function | FunctionCallback)[];
  delayedAttributes?: Record<string, string>;
}

export type Setting = {
  updateInterval: number;
  attributeUpdateInterval: number;
  reactiveRendering: boolean;
  reactiveStyling: boolean;
}

// Interface for the static side of the class, including static properties/methods
export interface Constructor {
  new(...args: any[]): CustomElement; // Constructor signature

  // static 
  PAPELEMENTINIT?: boolean;
  // observedAttributesSet?: Set<string>;
  observedAttributes?: string[];
  style?: string;
  styles?: string[];
}
