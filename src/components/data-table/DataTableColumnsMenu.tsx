import type { RowData } from "@tanstack/react-table";

import { Columns3, RotateCcw } from "lucide-react";

import { Button } from "../ui/button";

import { Checkbox } from "../ui/checkbox";

import { Popover } from "../ui/popover";

import styles from "./DataTable.module.css";

import type { DataTableColumnsMenuProps } from "./DataTable.types";

export function DataTableColumnsMenu<TData extends RowData>({
  columns,
  visibility,
  onVisibilityChange,
  onReset,
}: DataTableColumnsMenuProps<TData>) {
  const items = Object.entries(columns).flatMap(([id, column]) => {
    if (!column) {
      return [];
    }

    const label = typeof column === "string" ? column : column.label;

    const hideable = typeof column === "string" || column.hideable !== false;

    return [
      {
        id,
        label,
        hideable,
      },
    ];
  });

  const visibleCount = items.filter(
    (item) => visibility[item.id] !== false,
  ).length;

  const setVisible = (id: string, visible: boolean) => {
    if (!visible && visibleCount <= 1) {
      return;
    }

    onVisibilityChange({
      ...visibility,
      [id]: visible,
    });
  };

  return (
    <Popover>
      <Popover.Trigger
        render={
          <Button type="button" variant="secondary" size="sm">
            <Columns3 aria-hidden />
            Columns
          </Button>
        }
      />

      <Popover.Popup className={styles.columnsPopup}>
        <div className={styles.columnsMenuHeader}>
          <span className={styles.columnsMenuTitle}>Columns</span>

          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw aria-hidden />
            Reset
          </Button>
        </div>

        <div className={styles.columnsList}>
          {items.map((item) => {
            const checked = visibility[item.id] !== false;

            const disableHide =
              !item.hideable || (checked && visibleCount <= 1);

            return (
              <label key={item.id} className={styles.columnsItem}>
                <Checkbox
                  checked={checked}
                  disabled={disableHide}
                  onCheckedChange={(nextChecked) => {
                    setVisible(item.id, nextChecked);
                  }}
                />

                <span className={styles.columnsItemLabel}>{item.label}</span>
              </label>
            );
          })}
        </div>
      </Popover.Popup>
    </Popover>
  );
}
