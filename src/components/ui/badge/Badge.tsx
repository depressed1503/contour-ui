import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../../lib/cn";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends Omit<
  ComponentPropsWithoutRef<"span">,
  "className"
> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  variant = "neutral",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(styles.root, styles[variant], styles[size], className)}
    />
  );
}
