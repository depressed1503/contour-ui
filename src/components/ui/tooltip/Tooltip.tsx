import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "../../../lib/cn";
import styles from "./Tooltip.module.css";

import type {
  TooltipProps,
  TooltipTriggerProps,
  TooltipPopupProps,
} from "./Tooltip.types";

export function TooltipRoot(props: TooltipProps) {
  return <BaseTooltip.Root {...props} />;
}

export function TooltipTrigger({ className, ...props }: TooltipTriggerProps) {
  return <BaseTooltip.Trigger {...props} className={className} />;
}

export function TooltipPopup({
  className,
  children,
  ...props
}: TooltipPopupProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner sideOffset={6}>
        <BaseTooltip.Popup {...props} className={cn(styles.popup, className)}>
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
