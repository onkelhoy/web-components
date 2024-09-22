import { RenderType } from '@papit/core';

export type ValidityStateObject = Record<keyof ValidityState, string>;
export type MessageVariant = "information" | "success" | "warning" | "error";
export type Mode = "hug" | "fill";
export type State = "default" | "information" | "success" | "warning" | "error";

export type PrefixSuffixRender = Partial<{
  prefix: RenderType;
  content: RenderType;
  suffix: RenderType;
}>
export type RenderArgument = {
  header?: PrefixSuffixRender;
  footer?: PrefixSuffixRender;
  main: PrefixSuffixRender;
}