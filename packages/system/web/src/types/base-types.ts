// style related
export type Size = 'small' | 'medium' | 'large';
export type Radius = 'none' | 'small' | 'medium' | 'large' | 'circular';

// system
export type Devices = "mobile" | "pad" | "laptop" | "desktop";

export type PropertyConfig = {
  propertyKey: string;
  type: Function;
  typeName: string;
  attribute?: boolean | string;
}

// export type RenderType = DocumentFragment | string | undefined | string[] | DocumentFragment[];
// export interface CustomElement extends Omit<HTMLElement, 'style'> {
//   style: string[] | string;
//   observedAttributes: string[];

//   connectedCallback?(): void;
//   disconnectedCallback?(): void;
//   attributeChangedCallback?(name: string, newValue: string | null, oldValue: string | null): void;
//   firstRender?(): void;

//   // required
//   render(): RenderType;
// }
// // Interface for the static side of the class, including static properties/methods
// export interface CustomElementConstructor {
//   new(...args: any[]): CustomElement; // Constructor signature
//   style?: string[]; // Static property
// }
// export interface Base extends CustomElement {
//   connectedCallback(): void;
//   disconnectedCallback(): void;
//   attributeChangedCallback(name: string, newValue: string | null, oldValue: string | null): void;
//   observedAttributes(): string[];

//   requestUpdate(): void;
//   update(): void;

//   getProperties(): PropertyConfig[];
//   addProperty(config: PropertyConfig): void;

//   firstRender(): void;
//   render(): RenderType;
// }