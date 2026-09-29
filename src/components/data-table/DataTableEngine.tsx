import { useEffect, useRef } from "react";

import { useTable, type RowData } from "@tanstack/react-table";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Table } from "../ui/table";

import { dataTableFeatures } from "./DataTable.features";

import { DataTableFilterControl } from "./DataTableFilterControl";

import styles from "./DataTable.module.css";

import type {
  DataTableColumn,
  DataTableEngineProps,
  DataTableFilter,
  DataTableFilterDefinition,
} from "./DataTable.types";

export function DataTableEngine<TData extends RowData>({
  data,
  columns,
  columnDefinitions,
  getRowId,
  sorting,
  filters,
  columnVisibility,
  selectionEnabled,
  selectedRowIds,
  onSortingChange,
  onFiltersChange,
  onColumnVisibilityChange,
  onRowSelectionChange,
  onPageSelectionChange,
  renderRowActions,
}: DataTableEngineProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,

    data,
    columns,
    getRowId,

    defaultColumn: {
      enableSorting: false,
    },

    state: {
      sorting,
      columnVisibility,
    },

    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      onSortingChange(nextSorting);
    },

    onColumnVisibilityChange: (updater) => {
      const nextVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater;

      onColumnVisibilityChange(nextVisibility);
    },

    manualSorting: true,
  });

  const headerGroups = table.getHeaderGroups();

  const rows = table.getRowModel().rows;

  const pageRowIds = selectionEnabled
    ? rows.map((row) => getSelectionRowId(row.original, row.id, getRowId))
    : [];

  const selectedPageCount = pageRowIds.reduce(
    (result, rowId) => result + (selectedRowIds.has(rowId) ? 1 : 0),
    0,
  );

  const allPageSelected =
    pageRowIds.length > 0 && selectedPageCount === pageRowIds.length;

  const somePageSelected = selectedPageCount > 0 && !allPageSelected;

  const hasFilters = Object.values(columnDefinitions).some(
    (column) => typeof column !== "string" && Boolean(column?.filter),
  );

  const updateFilter = (
    id: string,

    nextFilter: DataTableFilter | null,
  ) => {
    const otherFilters = filters.filter((filter) => filter.id !== id);

    if (!nextFilter) {
      onFiltersChange(otherFilters);

      return;
    }

    onFiltersChange([...otherFilters, nextFilter]);
  };

  return (
    <Table>
      <Table.Header>
        {headerGroups.map((headerGroup) => (
          <Table.Row key={headerGroup.id} className={styles.headerRow}>
            {selectionEnabled ? (
              <Table.Head className={styles.selectionCell}>
                <SelectionCheckbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  disabled={pageRowIds.length === 0}
                  ariaLabel={
                    allPageSelected
                      ? "Deselect current page"
                      : "Select current page"
                  }
                  onChange={(checked) =>
                    onPageSelectionChange(pageRowIds, checked)
                  }
                />
              </Table.Head>
            ) : null}

            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();

              const direction = header.column.getIsSorted();

              return (
                <Table.Head key={header.id} className={styles.headerCell}>
                  <div className={styles.headerContent}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className={styles.headerLabel}>
                          <table.FlexRender header={header} />
                        </span>

                        {direction === "asc" ? (
                          <ArrowUp aria-hidden />
                        ) : direction === "desc" ? (
                          <ArrowDown aria-hidden />
                        ) : (
                          <ChevronsUpDown aria-hidden />
                        )}
                      </button>
                    ) : (
                      <span className={styles.headerLabel}>
                        <table.FlexRender header={header} />
                      </span>
                    )}
                  </div>
                </Table.Head>
              );
            })}

            {renderRowActions ? (
              <Table.Head className={styles.rowActionsCell}>
                <span className={styles.visuallyHidden}>Row actions</span>
              </Table.Head>
            ) : null}
          </Table.Row>
        ))}

        {hasFilters ? (
          <Table.Row className={styles.filtersRow}>
            {selectionEnabled ? (
              <Table.Head className={styles.selectionCell} />
            ) : null}

            {headerGroups[0]?.headers.map((header) => {
              const id = header.column.id;

              const definition = getColumnDefinition(columnDefinitions, id);

              const filterDefinition = getFilterDefinition(definition);

              const filter = filters.find((item) => item.id === id);

              return (
                <Table.Head
                  key={`filter-${header.id}`}
                  className={styles.filterCell}
                >
                  {filterDefinition ? (
                    <DataTableFilterControl
                      id={id}
                      definition={filterDefinition}
                      filter={filter}
                      onChange={(nextFilter) => updateFilter(id, nextFilter)}
                    />
                  ) : (
                    <div className={styles.emptyFilter} />
                  )}
                </Table.Head>
              );
            })}

            {renderRowActions ? (
              <Table.Head className={styles.rowActionsCell} />
            ) : null}
          </Table.Row>
        ) : null}
      </Table.Header>

      <Table.Body>
        {rows.map((row) => {
          const rowId = getSelectionRowId(row.original, row.id, getRowId);

          const selected = selectionEnabled && selectedRowIds.has(rowId);

          return (
            <Table.Row key={row.id} data-selected={selected ? "" : undefined}>
              {selectionEnabled ? (
                <Table.Cell className={styles.selectionCell}>
                  <SelectionCheckbox
                    checked={selected}
                    ariaLabel={selected ? "Deselect row" : "Select row"}
                    onChange={(checked) => onRowSelectionChange(rowId, checked)}
                  />
                </Table.Cell>
              ) : null}

              {row
                .getAllCells()
                .filter((cell) => cell.column.getIsVisible())
                .map((cell) => (
                  <Table.Cell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </Table.Cell>
                ))}

              {renderRowActions ? (
                <Table.Cell className={styles.rowActionsCell}>
                  {renderRowActions(row.original)}
                </Table.Cell>
              ) : null}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

interface SelectionCheckboxProps {
  checked: boolean;

  indeterminate?: boolean;

  disabled?: boolean;

  ariaLabel: string;

  onChange: (checked: boolean) => void;
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onChange,
}: SelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      className={styles.selectionCheckbox}
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

function getSelectionRowId<TData extends RowData>(
  row: TData,
  fallbackId: string,
  getRowId: ((row: TData) => string) | undefined,
): string {
  return getRowId ? getRowId(row) : fallbackId;
}

function getColumnDefinition<TData extends RowData>(
  columns: DataTableEngineProps<TData>["columnDefinitions"],
  id: string,
): string | DataTableColumn<TData, TData[keyof TData]> | undefined {
  return columns[id as keyof TData] as
    | string
    | DataTableColumn<TData, TData[keyof TData]>
    | undefined;
}

function getFilterDefinition<TData, TValue>(
  column: string | DataTableColumn<TData, TValue> | undefined,
): DataTableFilterDefinition | undefined {
  if (!column || typeof column === "string") {
    return undefined;
  }

  return column.filter;
}
