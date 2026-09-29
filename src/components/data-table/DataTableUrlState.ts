import type {
  RowData,
  SortingState,
} from "@tanstack/react-table";

import type {
  DataTableColumns,
  DataTableFilter,
  DataTableFilterConfig,
  DataTableFilterDefinition,
  DataTableFilterOperator,
  DataTableFilterPrimitive,
  DataTableFilterValue,
  DataTableRangeValue,
} from "./DataTable.types";

export interface DataTableUrlState {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: DataTableFilter[];
}

interface ReadDataTableUrlStateOptions<
  TData extends RowData,
> {
  columns: DataTableColumns<TData>;
  defaultPageSize: number;
}

export function readDataTableUrlState<
  TData extends RowData,
>({
  columns,
  defaultPageSize,
}: ReadDataTableUrlStateOptions<TData>): DataTableUrlState {
  const params =
    new URLSearchParams(
      window.location.search,
    );

  return {
    page: parsePositiveInteger(
      params.get("page"),
      1,
    ),

    pageSize:
      parsePositiveInteger(
        params.get("page_size"),
        defaultPageSize,
      ),

    sorting: readSorting(
      params,
      columns,
    ),

    filters: readFilters(
      params,
      columns,
    ),
  };
}

export function writeDataTableUrlState<
  TData extends RowData,
>(
  state: DataTableUrlState,
  columns: DataTableColumns<TData>,
): void {
  const params =
    new URLSearchParams(
      window.location.search,
    );

  removeDataTableParams(
    params,
    columns,
  );

  if (state.page > 1) {
    params.set(
      "page",
      String(state.page),
    );
  }

  params.set(
    "page_size",
    String(state.pageSize),
  );

  const ordering =
    serializeSorting(
      state.sorting,
    );

  if (ordering) {
    params.set(
      "ordering",
      ordering,
    );
  }

  for (const filter of state.filters) {
    const key =
      filter.operator === "exclude"
        ? `${filter.id}_not`
        : filter.id;

    const value =
      serializeFilterValue(
        filter.value,
      );

    if (value !== null) {
      params.set(
        key,
        value,
      );
    }
  }

  const search =
    params.toString();

  const nextUrl =
    `${window.location.pathname}` +
    `${search ? `?${search}` : ""}` +
    `${window.location.hash}`;

  const currentUrl =
    `${window.location.pathname}` +
    `${window.location.search}` +
    `${window.location.hash}`;

  if (nextUrl === currentUrl) {
    return;
  }

  window.history.replaceState(
    window.history.state,
    "",
    nextUrl,
  );
}

function readSorting<
  TData extends RowData,
>(
  params: URLSearchParams,
  columns: DataTableColumns<TData>,
): SortingState {
  const raw =
    params.get("ordering");

  if (!raw) {
    return [];
  }

  const sortableColumns =
    new Set(
      Object.entries(columns)
        .filter(
          ([, column]) =>
            typeof column !== "string" &&
            Boolean(column?.sortable),
        )
        .map(([id]) => id),
    );

  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const desc =
        part.startsWith("-");

      return {
        id: desc
          ? part.slice(1)
          : part,
        desc,
      };
    })
    .filter((sort) =>
      sortableColumns.has(
        sort.id,
      ),
    );
}

function readFilters<
  TData extends RowData,
>(
  params: URLSearchParams,
  columns: DataTableColumns<TData>,
): DataTableFilter[] {
  const filters:
    DataTableFilter[] = [];

  for (
    const [id, column] of
    Object.entries(columns)
  ) {
    if (
      !column ||
      typeof column === "string" ||
      !column.filter
    ) {
      continue;
    }

    const definition =
      normalizeFilterDefinition(
        column.filter,
      );

    const includeValue =
      params.get(id);

    const excludeValue =
      params.get(
        `${id}_not`,
      );

    const operator:
      DataTableFilterOperator =
        excludeValue !== null
          ? "exclude"
          : "include";

    const rawValue =
      excludeValue ??
      includeValue;

    if (rawValue === null) {
      continue;
    }

    const value =
      parseFilterValue(
        definition,
        rawValue,
      );

    if (value === null) {
      continue;
    }

    filters.push({
      id,
      operator,
      value,
    });
  }

  return filters;
}

function normalizeFilterDefinition(
  definition:
    DataTableFilterDefinition,
): DataTableFilterConfig {
  if (
    typeof definition !== "string"
  ) {
    return definition;
  }

  return {
    type: definition,
  };
}

function parseFilterValue(
  definition:
    DataTableFilterConfig,
  rawValue: string,
): DataTableFilterValue | null {
  switch (definition.type) {
    case "text":
    case "date":
    case "datetime":
      return rawValue || null;

    case "number":
      return parseNumber(
        rawValue,
      );

    case "select":
      return parseSelectValue(
        rawValue,
        definition.options,
      );

    case "multiselect":
      return parseMultiSelectValue(
        rawValue,
        definition.options,
      );

    case "number-range":
      return parseNumberRange(
        rawValue,
      );

    case "date-range":
    case "datetime-range":
      return parseStringRange(
        rawValue,
      );
  }
}

function parseSelectValue(
  rawValue: string,
  options: {
    value: DataTableFilterPrimitive;
    label: string;
  }[],
): DataTableFilterPrimitive | null {
  const option =
    options.find(
      (item) =>
        String(item.value) ===
        rawValue,
    );

  return option?.value ?? null;
}

function parseMultiSelectValue(
  rawValue: string,
  options: {
    value: DataTableFilterPrimitive;
    label: string;
  }[],
): DataTableFilterPrimitive[] | null {
  const values =
    rawValue
      .split(",")
      .filter(Boolean)
      .map(
        (rawItem) =>
          options.find(
            (option) =>
              String(
                option.value,
              ) === rawItem,
          )?.value,
      )
      .filter(
        (
          value,
        ): value is DataTableFilterPrimitive =>
          value !== undefined,
      );

  return values.length
    ? values
    : null;
}

function parseNumber(
  rawValue: string,
): number | null {
  if (
    rawValue.trim() === ""
  ) {
    return null;
  }

  const value =
    Number(rawValue);

  return Number.isFinite(value)
    ? value
    : null;
}

function parseNumberRange(
  rawValue: string,
): DataTableRangeValue<number> | null {
  const [fromRaw, toRaw] =
    splitRange(rawValue);

  const from =
    fromRaw === ""
      ? null
      : parseNumber(fromRaw);

  const to =
    toRaw === ""
      ? null
      : parseNumber(toRaw);

  if (
    from === null &&
    to === null
  ) {
    return null;
  }

  return {
    from,
    to,
  };
}

function parseStringRange(
  rawValue: string,
): DataTableRangeValue<string> | null {
  const [fromRaw, toRaw] =
    splitRange(rawValue);

  const from =
    fromRaw || null;

  const to =
    toRaw || null;

  if (
    from === null &&
    to === null
  ) {
    return null;
  }

  return {
    from,
    to,
  };
}

function splitRange(
  value: string,
): [string, string] {
  const index =
    value.indexOf("X");

  if (index === -1) {
    return [
      value,
      "",
    ];
  }

  return [
    value.slice(0, index),
    value.slice(index + 1),
  ];
}

function serializeSorting(
  sorting: SortingState,
): string {
  return sorting
    .map(
      ({ id, desc }) =>
        desc
          ? `-${id}`
          : id,
    )
    .join(",");
}

function serializeFilterValue(
  value:
    DataTableFilterValue,
): string | null {
  if (
    typeof value === "string"
  ) {
    return value || null;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (
    Array.isArray(value)
  ) {
    return value.length
      ? value
          .map(String)
          .join(",")
      : null;
  }

  return serializeRange(value);
}

function serializeRange(
  value:
    DataTableRangeValue<string | number>,
): string | null {
  const from =
    value.from === null
      ? ""
      : String(value.from);

  const to =
    value.to === null
      ? ""
      : String(value.to);

  if (!from && !to) {
    return null;
  }

  return `${from}X${to}`;
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function removeDataTableParams<
  TData extends RowData,
>(
  params: URLSearchParams,
  columns: DataTableColumns<TData>,
): void {
  params.delete("page");
  params.delete("page_size");
  params.delete("ordering");

  for (
    const [id, column] of
    Object.entries(columns)
  ) {
    if (
      !column ||
      typeof column === "string" ||
      !column.filter
    ) {
      continue;
    }

    params.delete(id);

    params.delete(
      `${id}_not`,
    );
  }
}