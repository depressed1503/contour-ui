import {
  DialogRoot,
  DialogTrigger,
  DialogClose,
  DialogPopup,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./Dialog";

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Close: DialogClose,
  Popup: DialogPopup,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
});

export type * from "./Dialog.types";