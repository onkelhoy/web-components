
import React from "react";

import { papHOC } from "@pap-it/system-react";

// web components
import { TableMenu as TableMenuElement } from "../src";
import "../src/register.js";

// exporting
export { TableMenu as TableMenuElement } from "../src";

export type TableMenuProps = React.HTMLAttributes<HTMLElement> & {
	headerTitle?: string; // [conditional]
	backdrop?: boolean; // default-value: true
	hideonoutsideclick?: boolean; // default-value: true
	open?: boolean;
	placement?: "left"|"right"|"top"|"bottom"; // default-value: right
	radius?: "none"|"small"|"medium"|"large"|"circular"; // default-value: medium
	mode?: "normal"|"fixed"; // default-value: normal
	width?: string; // [conditional]
	elevation?: "none"|"small"|"medium"|"large"|"x-large"; // default-value: none
	elevationdirection?: "vertical"|"horizontal"; // default-value: vertical
	onHide?: (e: React.SyntheticEvent<TableMenuElement, Event>) => void;
	onShow?: (e: React.SyntheticEvent<TableMenuElement, Event>) => void;
  children?: React.ReactNode;
  className?: string;
};
export type TableMenuAttributes = React.HTMLAttributes<HTMLElement> & {
	"header-title"?: string; // [conditional]
	"backdrop"?: string; // default-value: true
	"hideonoutsideclick"?: string; // default-value: true
	"open"?: string;
	"placement"?: string; // default-value: right
	"radius"?: string; // default-value: medium
	"mode"?: string; // default-value: normal
	"width"?: string; // [conditional]
	"elevation"?: string; // default-value: none
	"elevation-direction"?: string; // default-value: vertical
  children?: React.ReactNode;
  class?: string;
};

const Component = React.forwardRef<TableMenuElement, TableMenuAttributes>((props, forwardref) => {
  const { children, ...attributes } = props;

  return (
    <pap-table-menu
      {...attributes}
      ref={forwardref}
    >
      {children}
    </pap-table-menu>
  );
});

export const TableMenu = papHOC<TableMenuElement, TableMenuProps, TableMenuAttributes>(Component);