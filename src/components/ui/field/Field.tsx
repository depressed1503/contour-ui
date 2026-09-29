import { Field as BaseField } from "@base-ui/react/field";

import { cn } from "../../../lib/cn";
import styles from "./Field.module.css";

import type {
  FieldProps,
  FieldLabelProps,
  FieldDescriptionProps,
  FieldErrorProps,
} from "./Field.types";

export function FieldRoot({ className, ...props }: FieldProps) {
  return <BaseField.Root {...props} className={cn(styles.root, className)} />;
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <BaseField.Label {...props} className={cn(styles.label, className)} />;
}

export function FieldDescription({
  className,
  ...props
}: FieldDescriptionProps) {
  return (
    <BaseField.Description
      {...props}
      className={cn(styles.description, className)}
    />
  );
}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return <BaseField.Error {...props} className={cn(styles.error, className)} />;
}
