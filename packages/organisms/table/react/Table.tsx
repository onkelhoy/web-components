
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { Table as TableElement, IColumn, ICell, Config } from "../src";
import "../src/register.js";

// exporting
export { Table as TableElement } from "../src";

export type Props = React.HTMLAttributes<HTMLElement> & {
  tableTitle?: string; // [conditional]
  config?: Config; // default-value: DefaultConfig
  columns?: Array<IColumn>;
  data?: ICell[][];
  edit?: boolean;
  size?: number;
  scope?: string; // [conditional]
  children?: React.ReactNode;
  className?: string;
};
export type Attributes = React.HTMLAttributes<HTMLElement> & {
  "table-title"?: string; // [conditional]
  "edit"?: string;
  "size"?: string;
  "scope"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableElement, Attributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table>
  );
});

export const Table = papHOC<TableElement, Props, Attributes>(Component);