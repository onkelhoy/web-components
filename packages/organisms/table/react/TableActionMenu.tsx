
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableActionMenu as TableActionMenuElement } from "../src";
import "../src/register.js";

// exporting
export { TableActionMenu as TableActionMenuElement } from "../src";

export type TableActionMenuProps = React.HTMLAttributes<HTMLElement> & {

  children?: React.ReactNode;
  className?: string;
};
export type TableActionMenuAttributes = React.HTMLAttributes<HTMLElement> & {

  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableActionMenuElement, TableActionMenuAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-action-menu
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-action-menu>
  );
});

export const TableActionMenu = papHOC<TableActionMenuElement, TableActionMenuProps, TableActionMenuAttributes>(Component);