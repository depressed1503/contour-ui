import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  RowData,
  SortingState,
} from "@tanstack/react-table";

import {
  createDefaultColumnPreferences,
  readColumnPreferences,
  removeColumnPreferences,
  writeColumnPreferences,
} from "./DataTableColumnPreferences";

import {
  readDataTableUrlState,
  writeDataTableUrlState,
} from "./DataTableUrlState";

import type {
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnPreferences,
  DataTableColumns,
  DataTableDefinition,
  DataTableFilter,
  DataTableFilterDefinition,
  DataTableQuery,
} from "./DataTable.types";

const DEFAULT_PAGE_SIZE =
  25;

const DEFAULT_PAGE_SIZE_OPTIONS =
  [
    25,
    50,
    100,
  ];

const FILTER_DEBOUNCE_MS =
  300;

export function useDataTable<
  TData extends RowData,
>(
  definition:
    DataTableDefinition<TData>,
) {
  const defaultPageSize =
    definition.pagination
      ?.defaultPageSize ??
    DEFAULT_PAGE_SIZE;

  const pageSizeOptions =
    definition.pagination
      ?.pageSizeOptions ??
    DEFAULT_PAGE_SIZE_OPTIONS;

  const initialUrlState =
    useMemo(
      () =>
        readDataTableUrlState({
          columns:
            definition.columns,

          defaultPageSize,
        }),
      [
        definition.columns,
        defaultPageSize,
      ],
    );

  const initialColumnPreferences =
    useMemo(
      () =>
        readColumnPreferences(
          definition.id,
          definition.columns,
        ),
      [
        definition.id,
        definition.columns,
      ],
    );

  const [
    data,
    setData,
  ] =
    useState<TData[]>([]);

  const [
    count,
    setCount,
  ] =
    useState(0);

  const [
    page,
    setPage,
  ] =
    useState(
      initialUrlState.page,
    );

  const [
    pageSize,
    setPageSizeState,
  ] =
    useState(
      initialUrlState.pageSize,
    );

  const [
    sorting,
    setSortingState,
  ] =
    useState<SortingState>(
      initialUrlState.sorting,
    );

  const [
    draftFilters,
    setDraftFilters,
  ] =
    useState<
      DataTableFilter[]
    >(
      initialUrlState.filters,
    );

  const [
    filters,
    setFilters,
  ] =
    useState<
      DataTableFilter[]
    >(
      initialUrlState.filters,
    );

  const [
    columnPreferences,
    setColumnPreferences,
  ] =
    useState<
      DataTableColumnPreferences
    >(
      initialColumnPreferences,
    );

  const [
    selectedRowIds,
    setSelectedRowIds,
  ] =
    useState<
      Set<string>
    >(
      () => new Set(),
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      Error | null
    >(null);

  const [
    refreshVersion,
    setRefreshVersion,
  ] =
    useState(0);

  const filterTimerRef =
    useRef<
      number | null
    >(null);

  const selectionEnabled =
    definition.selection ===
    true;

  const columns =
    useMemo<
      DataTableColumnDef<TData>[]
    >(() => {
      return Object.entries(
        definition.columns,
      ).map(
        (
          [
            id,
            column,
          ],
        ) => {
          if (!column) {
            throw new Error(
              `DataTable "${definition.id}": column "${id}" is undefined`,
            );
          }

          const config =
            typeof column ===
            "string"
              ? {
                  label:
                    column,
                }
              : column;

          return {
            id,

            accessorFn: (
              row: TData,
            ) =>
              row[
                id as keyof TData
              ],

            header:
              config.label,

            enableSorting:
              config.sortable ??
              false,

            enableHiding:
              typeof column ===
                "string"
                ? true
                : column.hideable !==
                  false,

            cell: (
              context,
            ) => {
              const value =
                context.getValue();

              if (
                config.cell
              ) {
                return config.cell({
                  row:
                    context.row
                      .original,

                  value,
                });
              }

              if (
                value ===
                  null ||
                value ===
                  undefined
              ) {
                return null;
              }

              if (
                typeof value ===
                  "string" ||
                typeof value ===
                  "number"
              ) {
                return String(
                  value,
                );
              }

              if (
                typeof value ===
                "boolean"
              ) {
                return value
                  ? "true"
                  : "false";
              }

              return null;
            },
          };
        },
      );
    }, [
      definition.columns,
      definition.id,
    ]);

  useEffect(() => {
    if (
      selectionEnabled &&
      !definition.getRowId
    ) {
      throw new Error(
        `DataTable "${definition.id}": selection requires getRowId`,
      );
    }

    const editorNeedsRowId =
      Boolean(definition.editor?.edit) || Boolean(definition.editor?.delete);

    if (editorNeedsRowId && !definition.getRowId) {
      throw new Error(
        `DataTable "${definition.id}": edit/delete require getRowId`,
      );
    }
  }, [
    definition.editor?.delete,
    definition.editor?.edit,
    definition.getRowId,
    definition.id,
    selectionEnabled,
  ]);

  useEffect(() => {
    return () => {
      if (
        filterTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          filterTimerRef.current,
        );
      }
    };
  }, []);

  useEffect(() => {
    writeDataTableUrlState(
      {
        page,
        pageSize,
        sorting,
        filters,
      },

      definition.columns,
    );
  }, [
    definition.columns,
    page,
    pageSize,
    sorting,
    filters,
  ]);

  useEffect(() => {
    writeColumnPreferences(
      definition.id,
      columnPreferences,
    );
  }, [
    definition.id,
    columnPreferences,
  ]);

  useEffect(() => {
    const handlePopState =
      () => {
        const next =
          readDataTableUrlState({
            columns:
              definition.columns,

            defaultPageSize,
          });

        if (
          filterTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            filterTimerRef.current,
          );

          filterTimerRef.current =
            null;
        }

        setPage(
          next.page,
        );

        setPageSizeState(
          next.pageSize,
        );

        setSortingState(
          next.sorting,
        );

        setDraftFilters(
          next.filters,
        );

        setFilters(
          next.filters,
        );

        setSelectedRowIds(
          new Set(),
        );
      };

    window.addEventListener(
      "popstate",
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
    };
  }, [
    definition.columns,
    defaultPageSize,
  ]);

  useEffect(() => {
    const controller =
      new AbortController();

    const query =
      createDatasourceQuery(
        definition.columns,

        {
          page,
          pageSize,
          sorting,
          filters,
        },
      );

    setLoading(true);
    setError(null);

    definition.datasource
      .getList(
        query,
        controller.signal,
      )
      .then(
        (result) => {
          if (
            controller.signal
              .aborted
          ) {
            return;
          }

          setData(
            result.items,
          );

          setCount(
            result.count,
          );
        },
      )
      .catch(
        (
          requestError:
            unknown,
        ) => {
          if (
            controller.signal
              .aborted
          ) {
            return;
          }

          if (
            requestError instanceof
              DOMException &&
            requestError.name ===
              "AbortError"
          ) {
            return;
          }

          setError(
            requestError instanceof
              Error
              ? requestError
              : new Error(
                  "Unknown DataTable error",
                ),
          );
        },
      )
      .finally(() => {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(
            false,
          );
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    definition.datasource,
    definition.columns,
    page,
    pageSize,
    sorting,
    filters,
    refreshVersion,
  ]);

  const clearSelection =
    useCallback(() => {
      setSelectedRowIds(
        new Set(),
      );
    }, []);

  const setSorting = (
    nextSorting:
      SortingState,
  ) => {
    setSortingState(
      nextSorting,
    );

    setPage(1);

    clearSelection();
  };

  const setPageSize = (
    nextPageSize:
      number,
  ) => {
    setPageSizeState(
      nextPageSize,
    );

    setPage(1);
  };

  const setFilterDrafts = (
    nextFilters:
      DataTableFilter[],
  ) => {
    setDraftFilters(
      nextFilters,
    );

    clearSelection();

    if (
      filterTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        filterTimerRef.current,
      );
    }

    filterTimerRef.current =
      window.setTimeout(
        () => {
          setFilters(
            nextFilters,
          );

          setPage(1);

          filterTimerRef.current =
            null;
        },
        FILTER_DEBOUNCE_MS,
      );
  };

  const setColumnVisibility =
    (
      visibility:
        Record<
          string,
          boolean
        >,
    ) => {
      setColumnPreferences(
        (current) => ({
          ...current,
          visibility,
        }),
      );
    };

  const resetColumns =
    () => {
      removeColumnPreferences(
        definition.id,
      );

      setColumnPreferences(
        createDefaultColumnPreferences(
          definition.columns,
        ),
      );
    };

  const setRowSelected =
    (
      rowId: string,
      selected: boolean,
    ) => {
      setSelectedRowIds(
        (current) => {
          const ids =
            new Set(
              current,
            );

          if (selected) {
            ids.add(
              rowId,
            );
          } else {
            ids.delete(
              rowId,
            );
          }

          return ids;
        },
      );
    };

  const setPageSelected =
    (
      rowIds: string[],
      selected: boolean,
    ) => {
      setSelectedRowIds(
        (current) => {
          const ids =
            new Set(
              current,
            );

          for (
            const rowId of
            rowIds
          ) {
            if (selected) {
              ids.add(
                rowId,
              );
            } else {
              ids.delete(
                rowId,
              );
            }
          }

          return ids;
        },
      );
    };

  const selectedCount =
    selectedRowIds.size;

  const datasourceFilters =
    useMemo(() => {
      return createDatasourceQuery(
        definition.columns,
        {
          page: 1,
          pageSize,
          sorting: [],
          filters,
        },
      ).filters;
    }, [
      definition.columns,
      filters,
      pageSize,
    ]);

  const refresh =
    useCallback(() => {
      setRefreshVersion(
        (version) =>
          version + 1,
      );
    }, []);

  return {
    data,
    count,
    columns,

    loading,
    error,

    query: {
      page,
      pageSize,
      sorting,
      filters,
    },

    draftFilters,

    pageSizeOptions,

    columnVisibility:
      columnPreferences.visibility,

    columnOrder:
      columnPreferences.order,

    selectionEnabled,

    selectedRowIds,

    selectedCount,

    datasourceFilters,

    setPage,

    setPageSize,

    setSorting,

    setFilters:
      setFilterDrafts,

    setColumnVisibility,

    resetColumns,

    setRowSelected,

    setPageSelected,

    clearSelection,

    refresh,
  };
}

function createDatasourceQuery<
  TData extends RowData,
>(
  columns:
    DataTableColumns<TData>,

  query:
    DataTableQuery,
): DataTableQuery {
  return {
    ...query,

    sorting:
      query.sorting.map(
        (sort) => ({
          ...sort,

          id:
            getSortField(
              columns,
              sort.id,
            ),
        }),
      ),

    filters:
      query.filters.map(
        (filter) => ({
          ...filter,

          id:
            getFilterField(
              columns,
              filter.id,
            ),
        }),
      ),
  };
}

function getSortField<
  TData extends RowData,
>(
  columns:
    DataTableColumns<TData>,

  id: string,
): string {
  const column =
    getColumnDefinition(
      columns,
      id,
    );

  if (
    !column ||
    typeof column ===
      "string"
  ) {
    return id;
  }

  return (
    column.sortField ??
    id
  );
}

function getFilterField<
  TData extends RowData,
>(
  columns:
    DataTableColumns<TData>,

  id: string,
): string {
  const column =
    getColumnDefinition(
      columns,
      id,
    );

  if (
    !column ||
    typeof column ===
      "string" ||
    !column.filter
  ) {
    return id;
  }

  return (
    getFilterFieldFromDefinition(
      column.filter,
    ) ?? id
  );
}

function getFilterFieldFromDefinition(
  definition:
    DataTableFilterDefinition,
): string | undefined {
  if (
    typeof definition ===
    "string"
  ) {
    return undefined;
  }

  return definition.field;
}

function getColumnDefinition<
  TData extends RowData,
>(
  columns:
    DataTableColumns<TData>,

  id: string,
):
  | string
  | DataTableColumn<
      TData,
      TData[keyof TData]
    >
  | undefined {
  return columns[
    id as keyof TData
  ] as
    | string
    | DataTableColumn<
        TData,
        TData[keyof TData]
      >
    | undefined;
}