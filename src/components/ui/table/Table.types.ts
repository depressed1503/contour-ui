import type { ComponentPropsWithoutRef } from "react";

export type TableProps =
  ComponentPropsWithoutRef<"table">;

export type TableHeaderProps =
  ComponentPropsWithoutRef<"thead">;

export type TableBodyProps =
  ComponentPropsWithoutRef<"tbody">;

export type TableFooterProps =
  ComponentPropsWithoutRef<"tfoot">;

export type TableRowProps =
  ComponentPropsWithoutRef<"tr">;

export interface TableHeadProps
  extends ComponentPropsWithoutRef<"th"> {
  align?: "left" | "center" | "right";
}

export interface TableCellProps
  extends ComponentPropsWithoutRef<"td"> {
  align?: "left" | "center" | "right";
}