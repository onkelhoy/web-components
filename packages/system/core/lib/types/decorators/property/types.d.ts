export type Setting = {
    type: Function;
    attribute: boolean | string;
    rerender: boolean;
    onUpdate?: string;
    context?: boolean;
    verbose?: boolean;
    set?(value: any): any;
    get?(value: any): any;
    before?(value: any): void;
    after?(value: any, old: any): void;
};
export type PropertyInfo = {
    attribute: false | string;
    propertyKey: string;
    typeName: string;
    type: Function;
};
export type FixedSetting = Setting & PropertyInfo;
