import type {
  FieldRootProps as BaseFieldRootProps,
  FieldLabelProps as BaseFieldLabelProps,
  FieldDescriptionProps as BaseFieldDescriptionProps,
  FieldErrorProps as BaseFieldErrorProps,
} from "@base-ui/react/field";

export interface FieldProps
  extends Omit<BaseFieldRootProps, "className"> {
  className?: string;
}

export interface FieldLabelProps
  extends Omit<BaseFieldLabelProps, "className"> {
  className?: string;
}

export interface FieldDescriptionProps
  extends Omit<BaseFieldDescriptionProps, "className"> {
  className?: string;
}

export interface FieldErrorProps
  extends Omit<BaseFieldErrorProps, "className"> {
  className?: string;
}