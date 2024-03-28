
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableFormMenu as TableFormMenuElement } from "../src";
import "../src/register.js";

// exporting
export { TableFormMenu as TableFormMenuElement } from "../src";

export type TableFormMenuProps = React.HTMLAttributes<HTMLElement> & {

  children?: React.ReactNode;
  className?: string;
};
export type TableFormMenuAttributes = React.HTMLAttributes<HTMLElement> & {

  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableFormMenuElement, TableFormMenuAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-form-menu
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-form-menu>
  );
});

export const TableFormMenu = papHOC<TableFormMenuElement, TableFormMenuProps, TableFormMenuAttributes>(Component);