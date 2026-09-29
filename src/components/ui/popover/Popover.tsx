import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "../../../lib/cn";
import styles from "./Popover.module.css";

import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverPopupProps,
} from "./Popover.types";

export function PopoverRoot(props: PopoverProps) {
  return <BasePopover.Root {...props} />;
}

export function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  return <BasePopover.Trigger {...props} className={className} />;
}

export function PopoverPopup({
  className,
  children,
  ...props
}: PopoverPopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={6}>
        <BasePopover.Popup {...props} className={cn(styles.popup, className)}>
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
