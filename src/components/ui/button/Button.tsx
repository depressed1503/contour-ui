import {
  Button as BaseButton,
  type ButtonProps as BaseButtonProps,
} from "@base-ui/react/button";

import { cn } from "../../../lib/cn";
import { Spinner } from "./Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<BaseButtonProps, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  iconOnly = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        styles.root,
        styles[variant],
        styles[size],
        iconOnly && styles.iconOnly,
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </BaseButton>
  );
}
