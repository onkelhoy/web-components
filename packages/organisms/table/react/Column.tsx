
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { Column as ColumnElement } from "../src";
import "../src/register.js";

// exporting
export { Column as ColumnElement } from "../src";

export type ColumnProps = React.HTMLAttributes<HTMLElement> & {
	size?: "small"|"medium"|"large"; // default-value: medium
	align?: "left"|"center"|"right"; // default-value: left
	value?: string;
	sort?: "none"|"desc"|"asc"; // [conditional]
	subtitle?: string; // [conditional]
	columntitle?: string; // [conditional]
	databaseicon?: string; // [conditional]
  children?: React.ReactNode;
  className?: string;
};
export type ColumnAttributes = React.HTMLAttributes<HTMLElement> & {
	"size"?: string; // default-value: medium
	"align"?: string; // default-value: left
	"value"?: string;
	"sort"?: string; // [conditional]
	"sub-title"?: string; // [conditional]
	"column-title"?: string; // [conditional]
	"database-icon"?: string; // [conditional]
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<ColumnElement, ColumnAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-column
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-column>
  );
});

export const Column = papHOC<ColumnElement, ColumnProps, ColumnAttributes>(Component);