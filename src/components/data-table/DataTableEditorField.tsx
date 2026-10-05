import type { ReactNode } from "react";

import { DataFormField } from "../data-form/DataFormField";
import { resolveDataFormCondition } from "../data-form/DataForm.utils";

import type {
  DataTableEditorFieldDefinition,
  DataTableEditorMode,
  DataTableEditorValue,
  DataTableEditorValues,
} from "./DataTable.types";

interface DataTableEditorFieldProps {
  name: string;
  definition: DataTableEditorFieldDefinition;
  mode: DataTableEditorMode;
  value: DataTableEditorValue;
  values: DataTableEditorValues;
  error?: string;
  onBlur: () => void;
  onChange: (value: DataTableEditorValue) => void;
  renderCustom?: (
    context: {
      name: string;
      field: DataTableEditorFieldDefinition;
      mode: DataTableEditorMode;
      value: DataTableEditorValue;
      values: DataTableEditorValues;
      error?: string;
      setValue: (value: DataTableEditorValue) => void;
      disabled: boolean;
    },
  ) => ReactNode;
}

export function DataTableEditorField({
  name,
  definition,
  mode,
  value,
  values,
  error,
  onBlur,
  onChange,
  renderCustom,
}: DataTableEditorFieldProps) {
  const disabled =
    definition.readOnly === true ||
    resolveDataFormCondition(definition.disabled, { mode, values });

  const fieldDefinition = renderCustom
    ? {
        ...definition,
        render: (context: Parameters<NonNullable<typeof definition.render>>[0]) =>
          renderCustom({
            ...context,
            mode,
            values,
            error,
            setValue: onChange,
            disabled,
          }),
      }
    : definition;

  return (
    <DataFormField
      name={name}
      definition={fieldDefinition}
      mode={mode}
      value={value}
      values={values}
      error={error}
      disabled={disabled}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
}
