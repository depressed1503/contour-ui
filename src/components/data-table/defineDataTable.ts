import type {
  RowData,
} from "@tanstack/react-table";

import type {
  DataTableDefinition,
} from "./DataTable.types";

export function defineDataTable<
  TData extends RowData,
>(
  definition: DataTableDefinition<TData>,
): DataTableDefinition<TData> {
  return definition;
}