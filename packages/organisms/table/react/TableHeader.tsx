
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableHeader as TableHeaderElement } from "../src";
import "../src/register.js";

// exporting
export { TableHeader as TableHeaderElement } from "../src";

export type TableHeaderProps = React.HTMLAttributes<HTMLElement> & {
	scope?: string; // [conditional]
	onSave?: (e: React.SyntheticEvent<TableHeaderElement, Event>) => void;
	onSearch?: (e: React.SyntheticEvent<TableHeaderElement, CustomEvent>) => void; // detail: { value (note this is early and can be wrong)
	onAction?: (e: React.SyntheticEvent<TableHeaderElement, CustomEvent>) => void; // detail: {  (note this is early and can be wrong)
  children?: React.ReactNode;
  className?: string;
};
export type TableHeaderAttributes = React.HTMLAttributes<HTMLElement> & {
	"scope"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableHeaderElement, TableHeaderAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-header
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-header>
  );
});

export const TableHeader = papHOC<TableHeaderElement, TableHeaderProps, TableHeaderAttributes>(Component);