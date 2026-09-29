import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { cn } from "../../../lib/cn";
import styles from "./Dialog.module.css";

import type {
  DialogProps,
  DialogTriggerProps,
  DialogCloseProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogPopupProps,
  DialogHeaderProps,
  DialogFooterProps,
} from "./Dialog.types";

export function DialogRoot(props: DialogProps) {
  return <BaseDialog.Root {...props} />;
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger {...props} />;
}

export function DialogClose(props: DialogCloseProps) {
  return <BaseDialog.Close {...props} />;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title {...props} className={cn(styles.title, className)} />
  );
}

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      {...props}
      className={cn(styles.description, className)}
    />
  );
}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div {...props} className={cn(styles.header, className)} />;
}

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div {...props} className={cn(styles.footer, className)} />;
}

export function DialogPopup({
  className,
  children,
  ...props
}: DialogPopupProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />

      <BaseDialog.Popup {...props} className={cn(styles.popup, className)}>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
