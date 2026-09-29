import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../ui/button";
import { Select } from "../ui/select";

import styles from "./DataTable.module.css";

import type { DataTablePaginationProps } from "./DataTable.types";

export function DataTablePagination({
  page,
  pageSize,
  count,
  pageSizeOptions,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  const items = pageSizeOptions.map((value) => ({
    value,
    label: `${value} / page`,
  }));

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationCount}>
        {count} {count === 1 ? "item" : "items"}
      </span>

      <div className={styles.paginationControls}>
        <Select
          items={items}
          value={pageSize}
          disabled={disabled}
          onValueChange={(value) => {
            if (value !== null) {
              onPageSizeChange(value);
            }
          }}
        >
          <Select.Trigger className={styles.pageSize}>
            <Select.Value />
          </Select.Trigger>

          <Select.Popup>
            {items.map((item) => (
              <Select.Item key={item.value} value={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select>

        <span className={styles.pageLabel}>
          Page {page} of {pageCount}
        </span>

        <div className={styles.pageButtons}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft aria-hidden />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Next page"
            disabled={disabled || page >= pageCount}
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
