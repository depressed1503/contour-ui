import type { ComponentProps } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

export interface MenuProps
  extends ComponentProps<typeof BaseMenu.Root> {}

export interface MenuTriggerProps
  extends Omit<ComponentProps<typeof BaseMenu.Trigger>, "className"> {
  className?: string;
}

export interface MenuPopupProps
  extends Omit<ComponentProps<typeof BaseMenu.Popup>, "className"> {
  className?: string;
}

export type MenuItemVariant = "default" | "danger";

export interface MenuItemProps
  extends Omit<ComponentProps<typeof BaseMenu.Item>, "className"> {
  variant?: MenuItemVariant;
  className?: string;
}

export interface MenuSeparatorProps
  extends Omit<ComponentProps<typeof BaseMenu.Separator>, "className"> {
  className?: string;
}