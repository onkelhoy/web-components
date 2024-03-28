
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { Cell as CellElement } from "../src";
import "../src/register.js";

// exporting
export { Cell as CellElement } from "../src";

export type CellProps = React.HTMLAttributes<HTMLElement> & {
	size?: "small"|"medium"|"large"; // default-value: medium
	align?: "left"|"center"|"right"; // default-value: left
	editable?: boolean;
	mode?: "default"|"edit"; // default-value: default
	value?: string;
  children?: React.ReactNode;
  className?: string;
};
export type CellAttributes = React.HTMLAttributes<HTMLElement> & {
	"size"?: string; // default-value: medium
	"align"?: string; // default-value: left
	"editable"?: string;
	"mode"?: string; // default-value: default
	"value"?: string;
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<CellElement, CellAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-cell
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-cell>
  );
});

export const Cell = papHOC<CellElement, CellProps, CellAttributes>(Component);