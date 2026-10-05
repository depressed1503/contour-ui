import type { ReactNode } from "react";

import type { CrudDataSource, CrudDetail } from "../../lib/crud";

export type DataFormMode = "create" | "edit" | "view";

export type DataFormPrimitive = string | number | boolean;

export type DataFormValue = DataFormPrimitive | DataFormPrimitive[] | null;

export type DataFormValues = Record<string, DataFormValue>;

export interface DataFormOption<
  TValue extends DataFormPrimitive = DataFormPrimitive,
> {
  value: TValue;
  label: string;
}

export interface DataFormStateContext {
  mode: DataFormMode;
  values: DataFormValues;
}

export interface DataFormValidationContext extends DataFormStateContext {}

export type DataFormValidator = (
  value: DataFormValue,
  context: DataFormValidationContext,
) => string | undefined;

export type DataFormFieldCondition =
  | boolean
  | ((context: DataFormStateContext) => boolean);

export interface DataFormTransformContext extends DataFormStateContext {
  detail?: CrudDetail;
}

interface DataFormFieldBase {
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "multiselect"
    | "checkbox"
    | "date"
    | "datetime";

  /** Frontend label. */
  label: string;

  /**
   * Backend field name. If omitted, the frontend key is converted
   * from camelCase to snake_case.
   */
  field?: string;

  description?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  hidden?: DataFormFieldCondition;
  disabled?: DataFormFieldCondition;
  createOnly?: boolean;
  editOnly?: boolean;
  defaultValue?: DataFormValue;
  span?: number;

  validate?: DataFormValidator;

  /** Convert a backend value into a form value. */
  parse?: (
    value: unknown,
    detail: CrudDetail,
    context: DataFormStateContext,
  ) => DataFormValue;

  /** Convert a form value into a backend payload value. */
  serialize?: (
    value: DataFormValue,
    context: DataFormTransformContext,
  ) => unknown;

  /** Field-level escape hatch. */
  render?: (context: DataFormRenderFieldContext) => ReactNode;
}

export interface DataFormTextField extends DataFormFieldBase {
  type: "text";
  minLength?: number;
  maxLength?: number;
}

export interface DataFormTextareaField extends DataFormFieldBase {
  type: "textarea";
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

export interface DataFormNumberField extends DataFormFieldBase {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface DataFormSelectField extends DataFormFieldBase {
  type: "select";
  options: DataFormOption[];
}

export interface DataFormMultiSelectField extends DataFormFieldBase {
  type: "multiselect";
  options: DataFormOption[];
}

export interface DataFormCheckboxField extends DataFormFieldBase {
  type: "checkbox";
}

export interface DataFormDateField extends DataFormFieldBase {
  type: "date";
  min?: string;
  max?: string;
}

export interface DataFormDateTimeField extends DataFormFieldBase {
  type: "datetime";
  min?: string;
  max?: string;
}

export type DataFormFieldDefinition =
  | DataFormTextField
  | DataFormTextareaField
  | DataFormNumberField
  | DataFormSelectField
  | DataFormMultiSelectField
  | DataFormCheckboxField
  | DataFormDateField
  | DataFormDateTimeField;

export type DataFormFields = Record<string, DataFormFieldDefinition>;

export interface DataFormRenderFieldContext {
  name: string;
  field: DataFormFieldDefinition;
  mode: DataFormMode;
  value: DataFormValue;
  values: DataFormValues;
  error?: string;
  disabled: boolean;
  setValue: (value: DataFormValue) => void;
}

export interface DataFormLayout {
  columns?: number;
}

export interface DataFormSubmitContext<TItem> {
  mode: Extract<DataFormMode, "create" | "edit">;
  item: TItem;
  values: DataFormValues;
}

export interface DataFormDefinition<
  TItem,
  TDetail extends CrudDetail = CrudDetail,
> {
  id: string;
  datasource: CrudDataSource<TItem, TDetail>;
  fields: DataFormFields;
  layout?: DataFormLayout;
  createLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  renderAfter?: (context: DataFormStateContext) => ReactNode;
}

export interface DataFormProps<
  TItem,
  TDetail extends CrudDetail = CrudDetail,
> {
  definition: DataFormDefinition<TItem, TDetail>;
  mode: DataFormMode;
  id?: string | number;
  initialValues?: Partial<DataFormValues>;
  className?: string;
  onCancel?: () => void;
  onSuccess?: (context: DataFormSubmitContext<TItem>) => void;
}

export interface DataFormServerErrors {
  fields: Record<string, string>;
  form?: string;
}
