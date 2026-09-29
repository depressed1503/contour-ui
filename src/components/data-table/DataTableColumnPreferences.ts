import type {
  RowData,
} from "@tanstack/react-table";

import type {
  DataTableColumnPreferences,
  DataTableColumns,
} from "./DataTable.types";

const STORAGE_PREFIX =
  "data-table";

export function createDefaultColumnPreferences<
  TData extends RowData,
>(
  columns:
    DataTableColumns<TData>,
): DataTableColumnPreferences {
  const visibility:
    Record<string, boolean> = {};

  const sizing:
    Record<string, number> = {};

  const order:
    string[] = [];

  for (
    const [id, column] of
    Object.entries(columns)
  ) {
    if (!column) {
      continue;
    }

    order.push(id);

    if (
      typeof column !==
      "string"
    ) {
      if (
        column.visible ===
        false
      ) {
        visibility[id] =
          false;
      }

      if (
        column.size !==
        undefined
      ) {
        sizing[id] =
          column.size;
      }
    }
  }

  return {
    visibility,
    sizing,
    order,
  };
}

export function readColumnPreferences<
  TData extends RowData,
>(
  tableId: string,
  columns:
    DataTableColumns<TData>,
): DataTableColumnPreferences {
  const defaults =
    createDefaultColumnPreferences(
      columns,
    );

  if (
    typeof window ===
    "undefined"
  ) {
    return defaults;
  }

  try {
    const raw =
      window.localStorage.getItem(
        getStorageKey(
          tableId,
        ),
      );

    if (!raw) {
      return defaults;
    }

    const parsed:
      unknown =
      JSON.parse(raw);

    if (
      !isRecord(parsed)
    ) {
      return defaults;
    }

    const validIds =
      new Set(
        Object.keys(columns),
      );

    const visibility =
      readVisibility(
        parsed.visibility,
        validIds,
      );

    const sizing =
      readSizing(
        parsed.sizing,
        validIds,
      );

    const order =
      readOrder(
        parsed.order,
        validIds,
        defaults.order,
      );

    return {
      visibility: {
        ...defaults.visibility,
        ...visibility,
      },

      sizing: {
        ...defaults.sizing,
        ...sizing,
      },

      order,
    };
  } catch {
    return defaults;
  }
}

export function writeColumnPreferences(
  tableId: string,
  preferences:
    DataTableColumnPreferences,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(
        tableId,
      ),
      JSON.stringify(
        preferences,
      ),
    );
  } catch {
    // Table preferences are an enhancement.
    // localStorage errors must never break the table.
  }
}

export function removeColumnPreferences(
  tableId: string,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.removeItem(
      getStorageKey(
        tableId,
      ),
    );
  } catch {
    // Same rule: personalization must not
    // make DataTable unusable.
  }
}

function getStorageKey(
  tableId: string,
): string {
  return `${STORAGE_PREFIX}:${tableId}:columns`;
}

function readVisibility(
  value: unknown,
  validIds: Set<string>,
): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  const result:
    Record<string, boolean> = {};

  for (
    const [id, visible] of
    Object.entries(value)
  ) {
    if (
      validIds.has(id) &&
      typeof visible ===
        "boolean"
    ) {
      result[id] =
        visible;
    }
  }

  return result;
}

function readSizing(
  value: unknown,
  validIds: Set<string>,
): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  const result:
    Record<string, number> = {};

  for (
    const [id, size] of
    Object.entries(value)
  ) {
    if (
      validIds.has(id) &&
      typeof size ===
        "number" &&
      Number.isFinite(size) &&
      size > 0
    ) {
      result[id] =
        size;
    }
  }

  return result;
}

function readOrder(
  value: unknown,
  validIds: Set<string>,
  defaultOrder: string[],
): string[] {
  if (!Array.isArray(value)) {
    return defaultOrder;
  }

  const savedOrder =
    value.filter(
      (
        id,
      ): id is string =>
        typeof id ===
          "string" &&
        validIds.has(id),
    );

  const savedIds =
    new Set(savedOrder);

  const missingIds =
    defaultOrder.filter(
      (id) =>
        !savedIds.has(id),
    );

  return [
    ...savedOrder,
    ...missingIds,
  ];
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}