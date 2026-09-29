import type { ComponentProps } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";

export type SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple>;

export interface SelectTriggerProps
  extends Omit<ComponentProps<typeof BaseSelect.Trigger>, "className"> {
  className?: string;
}

export interface SelectValueProps
  extends Omit<ComponentProps<typeof BaseSelect.Value>, "className"> {
  className?: string;
}

export interface SelectPopupProps
  extends Omit<ComponentProps<typeof BaseSelect.Popup>, "className"> {
  className?: string;
}

export interface SelectItemProps
  extends Omit<ComponentProps<typeof BaseSelect.Item>, "className"> {
  className?: string;
}