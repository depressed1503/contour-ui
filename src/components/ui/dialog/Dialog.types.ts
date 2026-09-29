import type {
  ComponentProps,
  ComponentPropsWithoutRef,
} from "react";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";

export type DialogProps =
  ComponentProps<typeof BaseDialog.Root>;

export interface DialogTriggerProps
  extends Omit<ComponentProps<typeof BaseDialog.Trigger>, "className"> {
  className?: string;
}

export interface DialogCloseProps
  extends Omit<ComponentProps<typeof BaseDialog.Close>, "className"> {
  className?: string;
}

export interface DialogTitleProps
  extends Omit<ComponentProps<typeof BaseDialog.Title>, "className"> {
  className?: string;
}

export interface DialogDescriptionProps
  extends Omit<ComponentProps<typeof BaseDialog.Description>, "className"> {
  className?: string;
}

export interface DialogPopupProps
  extends Omit<ComponentProps<typeof BaseDialog.Popup>, "className"> {
  className?: string;
}

export interface DialogBackdropProps
  extends Omit<ComponentProps<typeof BaseDialog.Backdrop>, "className"> {
  className?: string;
}

export type DialogHeaderProps =
  ComponentPropsWithoutRef<"div">;

export type DialogFooterProps =
  ComponentPropsWithoutRef<"div">;