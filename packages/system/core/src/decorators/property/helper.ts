import { Setting } from "./types";

export function ConvertToString(value: any, type: Function) {
  switch (type.name) {
    case "Object":
    case "Array":
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

export function getInfo(this: any, propertyKey: string, attributeName: string, settings: Setting) {
  let info = this.properties?.[propertyKey];
  if (!info) {
    info = {
      attribute: settings.attribute ? attributeName : false,
      propertyKey,
      type: settings.type,
      typeName: settings.type.name
    }
    this.properties[propertyKey] = info;

    if (info.attribute) {
      this.attributeToPropertyMap.set(info.attribute, info.propertyKey)
    }
  }
}