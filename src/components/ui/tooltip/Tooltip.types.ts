import type {
  TooltipRootProps as BaseTooltipRootProps,
  TooltipTriggerProps as BaseTooltipTriggerProps,
  TooltipPopupProps as BaseTooltipPopupProps,
  TooltipPositionerProps as BaseTooltipPositionerProps,
} from "@base-ui/react/tooltip";

export type TooltipProps = BaseTooltipRootProps;

export interface TooltipTriggerProps
  extends Omit<BaseTooltipTriggerProps, "className"> {
  className?: string;
}

export interface TooltipPopupProps
  extends Omit<BaseTooltipPopupProps, "className"> {
  className?: string;
}

export type TooltipPositionerProps = BaseTooltipPositionerProps;