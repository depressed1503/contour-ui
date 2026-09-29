import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPopup,
} from "./Popover";

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Popup: PopoverPopup,
});

export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverPopupProps,
} from "./Popover.types";