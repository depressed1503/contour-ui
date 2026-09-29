import { Menu as BaseMenu } from "@base-ui/react/menu";

import { cn } from "../../../lib/cn";
import styles from "./Menu.module.css";

import type {
  MenuProps,
  MenuTriggerProps,
  MenuPopupProps,
  MenuItemProps,
  MenuSeparatorProps,
} from "./Menu.types";

export function MenuRoot(props: MenuProps) {
  return <BaseMenu.Root {...props} />;
}

export function MenuTrigger({ className, ...props }: MenuTriggerProps) {
  return <BaseMenu.Trigger {...props} className={className} />;
}

export function MenuPopup({ className, children, ...props }: MenuPopupProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={6}>
        <BaseMenu.Popup {...props} className={cn(styles.popup, className)}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({
  variant = "default",
  className,
  ...props
}: MenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      className={cn(styles.item, styles[variant], className)}
    />
  );
}

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      {...props}
      className={cn(styles.separator, className)}
    />
  );
}
