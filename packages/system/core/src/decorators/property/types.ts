export type Setting = {
  type: Function;
  attribute: boolean | string;
  removeAttribute?: boolean;
  rerender: boolean;
  onUpdate?: string;
  context?: boolean;
  verbose?: boolean;
  aria?: string;
  // spread?: string | Spread | boolean;
  set?(value: any): any; // SET would get called twice (as we cannot know if the value is changed or not at this point)
  get?(value: any): any;
  before?(value: any): void; // use before call instead of set if we just want to do extra stuff before setting the new value 
  after?(value: any, old: any): void; // use after call instead of set if we just want to do extra stuff after settin the new value
}

export type PropertyInfo = {
  attribute: false | string;
  propertyKey: string;
  typeName: string;
  type: Function;
  // NOTE do we want this?
  // context?: boolean; 
  // rerender?: boolean;
}

export type FixedSetting = Setting & PropertyInfo;