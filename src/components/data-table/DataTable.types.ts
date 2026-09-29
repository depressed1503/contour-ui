import type { ReactNode } from "react";

import type {
  ColumnDef,
  RowData,
  SortingState,
} from "@tanstack/react-table";

import { dataTableFeatures } from "./DataTable.features";

export type DataTableFilterPrimitive = string | number | boolean;

export type DataTableFilterType =
  | "text"
  | "select"
  | "multiselect"
  | "number"
  | "number-range"
  | "date"
  | "datetime"
  | "date-range"
  | "datetime-range";

export type DataTableFilterOperator = "include" | "exclude";

export interface DataTableRangeValue<TValue = string | number> {
  from: TValue | null;
  to: TValue | null;
}

export type DataTableFilterValue =
  | string
  | number
  | boolean
  | DataTableFilterPrimitive[]
  | DataTableRangeValue<string | number>;

export interface DataTableFilter {
  id: string;
  operator: DataTableFilterOperator;
  value: DataTableFilterValue;
}

export interface DataTableFilterOption<
  TValue extends DataTableFilterPrimitive = DataTableFilterPrimitive,
> {
  value: TValue;
  label: string;
}

interface DataTableFilterBase {
  field?: string;
}

export interface DataTableTextFilter extends DataTableFilterBase {
  type: "text";
}

export interface DataTableNumberFilter extends DataTableFilterBase {
  type: "number";
}

export interface DataTableNumberRangeFilter extends DataTableFilterBase {
  type: "number-range";
}

export interface DataTableDateFilter extends DataTableFilterBase {
  type: "date";
}

export interface DataTableDateTimeFilter extends DataTableFilterBase {
  type: "datetime";
}

export interface DataTableDateRangeFilter extends DataTableFilterBase {
  type: "date-range";
}

export interface DataTableDateTimeRangeFilter extends DataTableFilterBase {
  type: "datetime-range";
}

export interface DataTableSelectFilter extends DataTableFilterBase {
  type: "select";
  options: DataTableFilterOption[];
}

export interface DataTableMultiSelectFilter extends DataTableFilterBase {
  type: "multiselect";
  options: DataTableFilterOption[];
}

export type DataTableFilterConfig =
  | DataTableTextFilter
  | DataTableSelectFilter
  | DataTableMultiSelectFilter
  | DataTableNumberFilter
  | DataTableNumberRangeFilter
  | DataTableDateFilter
  | DataTableDateTimeFilter
  | DataTableDateRangeFilter
  | DataTableDateTimeRangeFilter;

export type DataTableSimpleFilterType =
  | "text"
  | "number"
  | "number-range"
  | "date"
  | "datetime"
  | "date-range"
  | "datetime-range";

export type DataTableFilterDefinition =
  | DataTableSimpleFilterType
  | DataTableFilterConfig;

export interface DataTableListResult<TData> {
  items: TData[];
  count: number;
}

export interface DataTableQuery {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: DataTableFilter[];
}

export type DataTableCrudPayload = Record<string, unknown>;
export type DataTableDetail = Record<string, unknown>;

export interface DataTableDataSource<TData> {
  getList(
    query: DataTableQuery,
    signal: AbortSignal,
  ): Promise<DataTableListResult<TData>>;

  getOne?(id: string, signal: AbortSignal): Promise<DataTableDetail>;

  create?(
    payload: DataTableCrudPayload,
    signal: AbortSignal,
  ): Promise<TData>;

  update?(
    id: string,
    payload: DataTableCrudPayload,
    signal: AbortSignal,
  ): Promise<TData>;

  delete?(id: string, signal: AbortSignal): Promise<void>;
}

export interface DataTableCellContext<TData, TValue> {
  row: TData;
  value: TValue;
}

export interface DataTableColumn<TData, TValue> {
  label: string;
  sortable?: boolean;
  sortField?: string;
  filter?: DataTableFilterDefinition;
  size?: number;
  minSize?: number;
  maxSize?: number;
  hideable?: boolean;
  visible?: boolean;
  cell?: (context: DataTableCellContext<TData, TValue>) => ReactNode;
}

export type DataTableColumns<TData extends RowData> = {
  [TKey in keyof TData]?:
    | string
    | DataTableColumn<TData, TData[TKey]>;
};

export interface DataTablePaginationConfig {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export type DataTableBulkScope = "selected" | "filtered";

export interface DataTableBulkIdsTarget {
  ids: string[];
}

export interface DataTableBulkFiltersTarget {
  filters: DataTableFilter[];
}

export type DataTableBulkTarget =
  | DataTableBulkIdsTarget
  | DataTableBulkFiltersTarget;

export type DataTableBulkActionVariant = "default" | "danger";

export interface DataTableBulkActionFieldsContext<TValues = unknown> {
  values: TValues;
  setValues: (values: TValues) => void;
  scope: DataTableBulkScope;
  selectedCount: number;
  totalCount: number;
}

export interface DataTableBulkActionContext<TValues = unknown> {
  target: DataTableBulkTarget;
  values: TValues;
  signal: AbortSignal;
}

export interface DataTableBulkAction<TValues = unknown> {
  id: string;
  label: string;
  variant?: DataTableBulkActionVariant;
  dialogTitle?: string;
  confirmLabel?: string;
  initialValues?: TValues | (() => TValues);
  renderFields?: (
    context: DataTableBulkActionFieldsContext<TValues>,
  ) => ReactNode;
  onAction: (
    context: DataTableBulkActionContext<TValues>,
  ) => void | Promise<void>;
  clearSelectionOnSuccess?: boolean;
  refreshOnSuccess?: boolean;
}

export type DataTableEditorMode = "create" | "edit";

export type DataTableEditorPrimitive = string | number | boolean;
export type DataTableEditorValue =
  | DataTableEditorPrimitive
  | DataTableEditorPrimitive[]
  | null;
export type DataTableEditorValues = Record<string, DataTableEditorValue>;

export interface DataTableEditorValidationContext {
  mode: DataTableEditorMode;
  values: DataTableEditorValues;
}

export type DataTableEditorValidator = (
  value: DataTableEditorValue,
  context: DataTableEditorValidationContext,
) => string | undefined;

interface DataTableEditorFieldBase {
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "multiselect"
    | "checkbox"
    | "date"
    | "datetime";
  label: string;
  field?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  createOnly?: boolean;
  editOnly?: boolean;
  hidden?: boolean;
  defaultValue?: DataTableEditorValue;
  validate?: DataTableEditorValidator;
}

export interface DataTableEditorTextField extends DataTableEditorFieldBase {
  type: "text";
  minLength?: number;
  maxLength?: number;
}

export interface DataTableEditorTextareaField
  extends DataTableEditorFieldBase {
  type: "textarea";
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

export interface DataTableEditorNumberField extends DataTableEditorFieldBase {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface DataTableEditorSelectField extends DataTableEditorFieldBase {
  type: "select";
  options: DataTableFilterOption[];
}

export interface DataTableEditorMultiSelectField
  extends DataTableEditorFieldBase {
  type: "multiselect";
  options: DataTableFilterOption[];
}

export interface DataTableEditorCheckboxField
  extends DataTableEditorFieldBase {
  type: "checkbox";
}

export interface DataTableEditorDateField extends DataTableEditorFieldBase {
  type: "date";
  min?: string;
  max?: string;
}

export interface DataTableEditorDateTimeField
  extends DataTableEditorFieldBase {
  type: "datetime";
  min?: string;
  max?: string;
}

export type DataTableEditorFieldDefinition =
  | DataTableEditorTextField
  | DataTableEditorTextareaField
  | DataTableEditorNumberField
  | DataTableEditorSelectField
  | DataTableEditorMultiSelectField
  | DataTableEditorCheckboxField
  | DataTableEditorDateField
  | DataTableEditorDateTimeField;

export type DataTableEditorFields = Record<
  string,
  DataTableEditorFieldDefinition
>;

export interface DataTableEditorActionConfig {
  label?: string;
  title?: string;
  description?: string;
}

export interface DataTableEditorDeleteConfig extends DataTableEditorActionConfig {
  confirmLabel?: string;
}

export type DataTableEditorCapability<TConfig> = boolean | TConfig;

export interface DataTableEditorRenderFieldContext {
  name: string;
  field: DataTableEditorFieldDefinition;
  mode: DataTableEditorMode;
  value: DataTableEditorValue;
  values: DataTableEditorValues;
  error?: string;
  setValue: (value: DataTableEditorValue) => void;
}

export interface DataTableEditorRenderAfterContext<TData> {
  mode: DataTableEditorMode;
  values: DataTableEditorValues;
  row?: TData;
}

export interface DataTableEditorConfig<TData> {
  entityLabel?: string;
  getRowLabel?: (row: TData) => string;
  create?: DataTableEditorCapability<DataTableEditorActionConfig>;
  edit?: DataTableEditorCapability<DataTableEditorActionConfig>;
  delete?: DataTableEditorCapability<DataTableEditorDeleteConfig>;
  fields: DataTableEditorFields;
  renderField?: Record<
    string,
    (context: DataTableEditorRenderFieldContext) => ReactNode
  >;
  renderAfter?: (
    context: DataTableEditorRenderAfterContext<TData>,
  ) => ReactNode;
}

export interface DataTableRowActionContext {
  refresh: () => void;
}

export interface DataTableRowAction<TData> {
  id: string;
  label: string;
  variant?: DataTableBulkActionVariant;
  hidden?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
  onAction: (
    row: TData,
    context: DataTableRowActionContext,
  ) => void | Promise<void>;
}

export interface DataTableDefinition<TData extends RowData> {
  id: string;
  datasource: DataTableDataSource<TData>;
  columns: DataTableColumns<TData>;
  selection?: boolean;
  getRowId?: (row: TData) => string;
  bulkActions?: DataTableBulkAction<unknown>[];
  rowActions?: DataTableRowAction<TData>[];
  editor?: DataTableEditorConfig<TData>;
  pagination?: DataTablePaginationConfig;
}

export interface DataTableColumnPreferences {
  visibility: Record<string, boolean>;
  sizing: Record<string, number>;
  order: string[];
}

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<typeof dataTableFeatures, TData, TValue>;

export interface DataTableEngineProps<TData extends RowData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  columnDefinitions: DataTableColumns<TData>;
  getRowId?: (row: TData) => string;
  sorting: SortingState;
  filters: DataTableFilter[];
  columnVisibility: Record<string, boolean>;
  selectionEnabled: boolean;
  selectedRowIds: Set<string>;
  renderRowActions?: (row: TData) => ReactNode;
  onSortingChange: (sorting: SortingState) => void;
  onFiltersChange: (filters: DataTableFilter[]) => void;
  onColumnVisibilityChange: (
    visibility: Record<string, boolean>,
  ) => void;
  onRowSelectionChange: (rowId: string, selected: boolean) => void;
  onPageSelectionChange: (rowIds: string[], selected: boolean) => void;
}

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  count: number;
  pageSizeOptions: number[];
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface DataTableColumnsMenuProps<TData extends RowData> {
  columns: DataTableColumns<TData>;
  visibility: Record<string, boolean>;
  onVisibilityChange: (visibility: Record<string, boolean>) => void;
  onReset: () => void;
}

export interface DataTableProps<TData extends RowData> {
  definition: DataTableDefinition<TData>;
}
