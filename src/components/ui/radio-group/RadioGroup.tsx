import { Radio } from "@base-ui/react/radio";

import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../../lib/cn";

import styles from "./RadioGroup.module.css";

export interface RadioGroupProps
  extends Omit<ComponentProps<typeof BaseRadioGroup>, "className"> {
  className?: string;
}

export interface RadioGroupItemProps extends Omit<
  ComponentProps<typeof Radio.Root>,
  "children" | "className"
> {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function RadioGroupRoot({ className, ...props }: RadioGroupProps) {
  return <BaseRadioGroup className={cn(styles.root, className)} {...props} />;
}

export function RadioGroupItem({
  className,
  label,
  description,
  disabled,
  ...props
}: RadioGroupItemProps) {
  return (
    <label className={cn(styles.item, disabled && styles.disabled)}>
      <Radio.Root
        className={cn(styles.radio, className)}
        disabled={disabled}
        {...props}
      >
        <Radio.Indicator className={styles.indicator} />
      </Radio.Root>

      <span className={styles.content}>
        <span className={styles.label}>{label}</span>

        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
      </span>
    </label>
  );
}

