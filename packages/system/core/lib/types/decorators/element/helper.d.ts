import { Setting, Constructor, CustomElement } from "./types";
export declare function combinedStyle(constructor: Constructor): string;
export declare function ConvertFromString(value: string | null, type: Function): any;
export declare function renderStyle(setting: Setting, element: CustomElement, constructor: Constructor): void;
export declare function renderHTML(setting: Setting, element: CustomElement, constructor: Constructor): void;
