import {
  Input as BaseInput,
  type InputProps as BaseInputProps,
} from "@base-ui/react";

import styles from "./Input.module.css";
import { cn } from "../../../lib/cn";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<BaseInputProps, "className" | "size"> {
  size?: InputSize;
  invalid?: boolean;
  className?: string;
}

export function Input({
  size = "md",
  invalid = false,
  className,
  ...props
}: InputProps) {
  return (
    <BaseInput
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        styles.root,
        styles[size],
        invalid && styles.invalid,
        className,
      )}
    />
  );
}
