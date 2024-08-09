import { Setting } from "./types";
export declare function Decorator<T extends Element = HTMLElement>(setting: string | Setting<T>): (target: HTMLElement, propertyKey: string) => void;
