import type { TextareaHTMLAttributes } from "react";

import { cn } from "../../../lib/cn";
import styles from "./Textarea.module.css";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  invalid?: boolean;
  className?: string;
}

export function Textarea({
  invalid = false,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(styles.root, invalid && styles.invalid, className)}
    />
  );
}
