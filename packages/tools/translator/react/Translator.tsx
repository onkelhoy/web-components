
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { Translator as TranslatorElement } from "../src";
import "../src/register.js";

// exporting
export { Translator as TranslatorElement } from "../src";

export type Props = React.HTMLAttributes<HTMLElement> & {
  scope?: string; // [conditional]
  children?: React.ReactNode;
  className?: string;
} & Record<string, string>;
export type Attributes = React.HTMLAttributes<HTMLElement> & {
  scope?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TranslatorElement, Attributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-translator
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-translator>
  );
});

export const Translator = papHOC<TranslatorElement, Props, Attributes>(Component);