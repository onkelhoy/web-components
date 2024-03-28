
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableFilter as TableFilterElement } from "../src";
import "../src/register.js";

// exporting
export { TableFilter as TableFilterElement } from "../src";

export type TableFilterProps = React.HTMLAttributes<HTMLElement> & {
	iscustomfilters?: boolean;
	scope?: string; // [conditional]
	onApply?: (e: React.SyntheticEvent<TableFilterElement, CustomEvent>) => void; // detail: {  (note this is early and can be wrong)
  children?: React.ReactNode;
  className?: string;
};
export type TableFilterAttributes = React.HTMLAttributes<HTMLElement> & {
	"is-custom-filter"?: string;
	"scope"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableFilterElement, TableFilterAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-filter
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-filter>
  );
});

export const TableFilter = papHOC<TableFilterElement, TableFilterProps, TableFilterAttributes>(Component);