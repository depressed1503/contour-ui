import { Check, ChevronDown } from "lucide-react";
import { Select as BaseSelect } from "@base-ui/react/select";

import { cn } from "../../../lib/cn";
import styles from "./Select.module.css";

import type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectPopupProps,
  SelectItemProps,
} from "./Select.types";

export function SelectRoot<Value, Multiple extends boolean | undefined = false>(
  props: SelectProps<Value, Multiple>,
) {
  return <BaseSelect.Root {...props} />;
}

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger {...props} className={cn(styles.trigger, className)}>
      {children}

      <BaseSelect.Icon className={styles.icon}>
        <ChevronDown aria-hidden />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <BaseSelect.Value {...props} className={cn(styles.value, className)} />
  );
}

export function SelectPopup({
  className,
  children,
  ...props
}: SelectPopupProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner sideOffset={4} className={styles.positioner}>
        <BaseSelect.Popup {...props} className={cn(styles.popup, className)}>
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item {...props} className={cn(styles.item, className)}>
      <BaseSelect.ItemText className={styles.itemText}>
        {children}
      </BaseSelect.ItemText>

      <BaseSelect.ItemIndicator className={styles.indicator}>
        <Check aria-hidden />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
