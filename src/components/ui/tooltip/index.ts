import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPopup,
} from "./Tooltip";

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Popup: TooltipPopup,
});

export type {
  TooltipProps,
  TooltipTriggerProps,
  TooltipPopupProps,
} from "./Tooltip.types";