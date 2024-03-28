
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableManage as TableManageElement } from "../src";
import "../src/register.js";

// exporting
export { TableManage as TableManageElement } from "../src";

export type TableManageProps = React.HTMLAttributes<HTMLElement> & {
	scope?: string; // [conditional]
	onAdd?: (e: React.SyntheticEvent<TableManageElement, Event>) => void;
  children?: React.ReactNode;
  className?: string;
};
export type TableManageAttributes = React.HTMLAttributes<HTMLElement> & {
	"scope"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableManageElement, TableManageAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-manage
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-manage>
  );
});

export const TableManage = papHOC<TableManageElement, TableManageProps, TableManageAttributes>(Component);