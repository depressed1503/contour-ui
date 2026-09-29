import type {
  DataTableCrudPayload,
  DataTableDetail,
  DataTableEditorFieldDefinition,
  DataTableEditorFields,
  DataTableEditorMode,
  DataTableEditorValue,
  DataTableEditorValues,
} from "./DataTable.types";

export function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

export function getEditorBackendField(
  name: string,
  field: DataTableEditorFieldDefinition,
): string {
  return field.field ?? toSnakeCase(name);
}

export function getEditorFieldsForMode(
  fields: DataTableEditorFields,
  mode: DataTableEditorMode,
): Array<[string, DataTableEditorFieldDefinition]> {
  return Object.entries(fields).filter(([, field]) => {
    if (field.hidden) {
      return false;
    }

    if (mode === "create" && field.editOnly) {
      return false;
    }

    if (mode === "edit" && field.createOnly) {
      return false;
    }

    return true;
  });
}

export function createEditorValues(
  fields: DataTableEditorFields,
  mode: DataTableEditorMode,
  detail?: DataTableDetail,
): DataTableEditorValues {
  const values: DataTableEditorValues = {};

  for (const [name, field] of getEditorFieldsForMode(fields, mode)) {
    const backendField = getEditorBackendField(name, field);

    if (detail && backendField in detail) {
      values[name] = normalizeEditorValue(detail[backendField], field);
      continue;
    }

    if (detail && name in detail) {
      values[name] = normalizeEditorValue(detail[name], field);
      continue;
    }

    values[name] = getEditorDefaultValue(field);
  }

  return values;
}

export function createEditorPayload(
  fields: DataTableEditorFields,
  mode: DataTableEditorMode,
  values: DataTableEditorValues,
): DataTableCrudPayload {
  const payload: DataTableCrudPayload = {};

  for (const [name, field] of getEditorFieldsForMode(fields, mode)) {
    payload[getEditorBackendField(name, field)] = values[name] ?? null;
  }

  return payload;
}

export function validateEditorField(
  field: DataTableEditorFieldDefinition,
  value: DataTableEditorValue,
  mode: DataTableEditorMode,
  values: DataTableEditorValues,
): string | undefined {
  if (field.required && isEmptyEditorValue(value, field)) {
    return `${field.label} is required.`;
  }

  if (typeof value === "string") {
    if (
      (field.type === "text" || field.type === "textarea") &&
      field.minLength !== undefined &&
      value.length < field.minLength
    ) {
      return `${field.label} must contain at least ${field.minLength} characters.`;
    }

    if (
      (field.type === "text" || field.type === "textarea") &&
      field.maxLength !== undefined &&
      value.length > field.maxLength
    ) {
      return `${field.label} must contain at most ${field.maxLength} characters.`;
    }
  }

  if (field.type === "number" && typeof value === "number") {
    if (field.min !== undefined && value < field.min) {
      return `${field.label} must be at least ${field.min}.`;
    }

    if (field.max !== undefined && value > field.max) {
      return `${field.label} must be at most ${field.max}.`;
    }
  }

  return field.validate?.(value, {
    mode,
    values,
  });
}

function getEditorDefaultValue(
  field: DataTableEditorFieldDefinition,
): DataTableEditorValue {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if (field.type === "checkbox") {
    return false;
  }

  if (field.type === "multiselect") {
    return [];
  }

  if (field.type === "number") {
    return null;
  }

  return "";
}

function normalizeEditorValue(
  value: unknown,
  field: DataTableEditorFieldDefinition,
): DataTableEditorValue {
  if (value === null || value === undefined) {
    return getEditorDefaultValue(field);
  }

  if (field.type === "multiselect") {
    return Array.isArray(value)
      ? value.filter(isEditorPrimitive)
      : [];
  }

  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    if (typeof value === "number") {
      return value;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (field.type === "date" && typeof value === "string") {
    return value.slice(0, 10);
  }

  if (field.type === "datetime" && typeof value === "string") {
    return value.slice(0, 16);
  }

  if (isEditorPrimitive(value)) {
    return value;
  }

  return String(value);
}

function isEditorPrimitive(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isEmptyEditorValue(
  value: DataTableEditorValue,
  field: DataTableEditorFieldDefinition,
): boolean {
  if (field.type === "checkbox") {
    return value !== true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return value === null || value === "";
}
