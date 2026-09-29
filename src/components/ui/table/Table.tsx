import { cn } from "../../../lib/cn";
import styles from "./Table.module.css";

import type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from "./Table.types";

export function TableRoot({ className, ...props }: TableProps) {
  return (
    <div className={styles.container}>
      <table {...props} className={cn(styles.root, className)} />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead {...props} className={cn(styles.header, className)} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody {...props} className={cn(styles.body, className)} />;
}

export function TableFooter({ className, ...props }: TableFooterProps) {
  return <tfoot {...props} className={cn(styles.footer, className)} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr {...props} className={cn(styles.row, className)} />;
}

export function TableHead({
  align = "left",
  className,
  ...props
}: TableHeadProps) {
  return (
    <th {...props} className={cn(styles.head, styles[align], className)} />
  );
}

export function TableCell({
  align = "left",
  className,
  ...props
}: TableCellProps) {
  return (
    <td {...props} className={cn(styles.cell, styles[align], className)} />
  );
}
