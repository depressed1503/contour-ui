import {
  FieldRoot,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "./Field";

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
});

export type {
  FieldProps,
  FieldLabelProps,
  FieldDescriptionProps,
  FieldErrorProps,
} from "./Field.types";