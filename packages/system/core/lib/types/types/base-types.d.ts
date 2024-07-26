export type Size = 'small' | 'medium' | 'large';
export type Radius = 'none' | 'small' | 'medium' | 'large' | 'circular';
export type Devices = "mobile" | "pad" | "laptop" | "desktop";
export type PropertyConfig = {
    propertyKey: string;
    type: Function;
    typeName: string;
    attribute?: boolean | string;
};
