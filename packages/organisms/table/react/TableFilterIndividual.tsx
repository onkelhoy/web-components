
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableFilterIndividual as TableFilterIndividualElement } from "../src";
import "../src/register.js";

// exporting
export { TableFilterIndividual as TableFilterIndividualElement } from "../src";

export type TableFilterIndividualProps = React.HTMLAttributes<HTMLElement> & {
	columns?: Array<any>;
	scope?: string; // [conditional]
	onRemove?: (e: React.SyntheticEvent<TableFilterIndividualElement, Event>) => void;
	onChange?: (e: React.SyntheticEvent<TableFilterIndividualElement, CustomEvent>) => void; // detail: { column filters (note this is early and can be wrong)
  children?: React.ReactNode;
  className?: string;
};
export type TableFilterIndividualAttributes = React.HTMLAttributes<HTMLElement> & {
	"scope"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableFilterIndividualElement, TableFilterIndividualAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-filter-individual
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-filter-individual>
  );
});

export const TableFilterIndividual = papHOC<TableFilterIndividualElement, TableFilterIndividualProps, TableFilterIndividualAttributes>(Component);