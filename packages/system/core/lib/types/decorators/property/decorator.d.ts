import { Setting } from "./types";
import { CustomElement } from '../../class/element';
export declare function Decorator(setting?: Partial<Setting>): (target: CustomElement, propertyKey: string) => void;
