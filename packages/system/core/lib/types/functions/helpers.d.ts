import { Devices } from "../types";
export declare function debounce<T extends (...args: any[]) => any>(execute: T, delay?: number): (...args: Parameters<T>) => void;
export declare function generateUUID(): string;
export declare function NextParent<T = HTMLElement>(element: HTMLElement): HTMLElement | T | null;
export declare function CumulativeOffset(element: HTMLElement): {
    top: number;
    left: number;
};
export declare function ExtractSlotValue(slot: HTMLSlotElement): string[];
export declare function FormatNumber(num: number): string;
export declare function DetectDevice(component: HTMLElement): Devices;
export declare function lerp(a: number, b: number, t: number): number;
export declare function lerpValue(value: number, min: number, max: number, newmin: number, newmax: number): number;
