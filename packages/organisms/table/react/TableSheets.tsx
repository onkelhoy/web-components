
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableSheets as TableSheetsElement } from "../src";
import "../src/register.js";

// exporting
export { TableSheets as TableSheetsElement } from "../src";

export type TableSheetsProps = React.HTMLAttributes<HTMLElement> & {
	list?: Array<any>;
	selected?: string; // [conditional]
	scope?: string; // [conditional]
  children?: React.ReactNode;
  className?: string;
};
export type TableSheetsAttributes = React.HTMLAttributes<HTMLElement> & {
	"selected"?: string; // [conditional]
	"scope"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableSheetsElement, TableSheetsAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-sheets
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-sheets>
  );
});

export const TableSheets = papHOC<TableSheetsElement, TableSheetsProps, TableSheetsAttributes>(Component);