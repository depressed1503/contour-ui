import {
  MenuRoot,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from "./Menu";

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Popup: MenuPopup,
  Item: MenuItem,
  Separator: MenuSeparator,
});

export type {
  MenuProps,
  MenuTriggerProps,
  MenuPopupProps,
  MenuItemProps,
  MenuItemVariant,
  MenuSeparatorProps,
} from "./Menu.types";