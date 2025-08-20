export type ValidityStateObject = Record<keyof ValidityState, string>;
export type MessageVariant = "information" | "success" | "warning" | "error";
export type Mode = "hug" | "fill";
export type State = "default" | "information" | "success" | "warning" | "error";
export type Color = 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'information' | 'success';
export type Size = 'small' | 'medium' | 'large';
export type Radius = Size | 'circle';

export type PrefixSuffixRender = Partial<{
  prefix: string|Element;
  content: string|Element;
  suffix: string|Element;
}>
export type RenderArgument = {
  header?: PrefixSuffixRender;
  footer?: PrefixSuffixRender;
  main: PrefixSuffixRender;
}