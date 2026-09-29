import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "./Select";

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Popup: SelectPopup,
  Item: SelectItem,
});

export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectPopupProps,
  SelectItemProps,
} from "./Select.types";