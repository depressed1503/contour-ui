import {
  Checkbox as BaseCheckbox,
  type CheckboxRootProps as BaseCheckboxRootProps,
} from "@base-ui/react/checkbox";

import { Check, Minus } from "lucide-react";

import { cn } from "../../../lib/cn";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends Omit<
  BaseCheckboxRootProps,
  "className"
> {
  className?: string;
}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root {...props} className={cn(styles.root, className)}>
      <BaseCheckbox.Indicator className={styles.indicator}>
        {props.indeterminate ? (
          <Minus aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
