import type {
  PopoverRootProps as BasePopoverRootProps,
  PopoverTriggerProps as BasePopoverTriggerProps,
  PopoverPopupProps as BasePopoverPopupProps,
} from "@base-ui/react/popover";

export type PopoverProps = BasePopoverRootProps;

export interface PopoverTriggerProps
  extends Omit<BasePopoverTriggerProps, "className"> {
  className?: string;
}

export interface PopoverPopupProps
  extends Omit<BasePopoverPopupProps, "className"> {
  className?: string;
}