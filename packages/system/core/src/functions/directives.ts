export function ifDefined(value: any) {
  return value === undefined ? undefined : String(value);
}