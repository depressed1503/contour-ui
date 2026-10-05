import {
  createDataFormPayload,
  createDataFormValues,
  getDataFormBackendField,
  getDataFormFieldsForMode,
  toSnakeCase,
  validateDataFormField,
} from "../data-form/DataForm.utils";

import type {
  DataTableCrudPayload,
  DataTableDetail,
  DataTableEditorFieldDefinition,
  DataTableEditorFields,
  DataTableEditorMode,
  DataTableEditorValue,
  DataTableEditorValues,
} from "./DataTable.types";

export { toSnakeCase };

export function getEditorBackendField(
  name: string,
  field: DataTableEditorFieldDefinition,
): string {
  return getDataFormBackendField(name, field);
}

export function getEditorFieldsForMode(
  fields: DataTableEditorFields,
  mode: DataTableEditorMode,
): Array<[string, DataTableEditorFieldDefinition]> {
  return getDataFormFieldsForMode(fields, mode);
}

export function createEditorValues(
  fields: DataTableEditorFields,
  mode: DataTableEditorMode,
  detail?: DataTableDetail,
): DataTableEditorValues {
  return createDataFormValues(fields, mode, detail);
}

export function createEditorPayload(
  fields: DataTableEditorFields,
  mode: DataTableEditorMode,
  values: DataTableEditorValues,
): DataTableCrudPayload {
  return createDataFormPayload(fields, mode, values);
}

export function validateEditorField(
  field: DataTableEditorFieldDefinition,
  value: DataTableEditorValue,
  mode: DataTableEditorMode,
  values: DataTableEditorValues,
): string | undefined {
  return validateDataFormField(field, value, mode, values);
}
