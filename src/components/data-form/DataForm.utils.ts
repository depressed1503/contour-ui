import type { CrudDetail, CrudPayload } from "../../lib/crud";
import type {
  DataFormFieldDefinition,
  DataFormFields,
  DataFormMode,
  DataFormServerErrors,
  DataFormStateContext,
  DataFormValue,
  DataFormValues,
} from "./DataForm.types";

export function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

export function getDataFormBackendField(
  name: string,
  field: DataFormFieldDefinition,
): string {
  return field.field ?? toSnakeCase(name);
}

export function isDataFormFieldAvailableInMode(
  field: DataFormFieldDefinition,
  mode: DataFormMode,
): boolean {
  if (mode === "create" && field.editOnly) {
    return false;
  }

  if ((mode === "edit" || mode === "view") && field.createOnly) {
    return false;
  }

  return true;
}

export function resolveDataFormCondition(
  condition: DataFormFieldDefinition["hidden"] | undefined,
  context: DataFormStateContext,
): boolean {
  if (typeof condition === "function") {
    return condition(context);
  }

  return Boolean(condition);
}

export function getDataFormFieldsForMode(
  fields: DataFormFields,
  mode: DataFormMode,
): Array<[string, DataFormFieldDefinition]> {
  return Object.entries(fields).filter(([, field]) =>
    isDataFormFieldAvailableInMode(field, mode),
  );
}

export function createDataFormValues(
  fields: DataFormFields,
  mode: DataFormMode,
  detail?: CrudDetail,
  initialValues?: Partial<DataFormValues>,
): DataFormValues {
  const values: DataFormValues = {};

  for (const [name, field] of getDataFormFieldsForMode(fields, mode)) {
    if (initialValues && name in initialValues) {
      values[name] = initialValues[name] ?? null;
      continue;
    }

    const backendField = getDataFormBackendField(name, field);

    if (detail && backendField in detail) {
      values[name] = parseDataFormValue(
        detail[backendField],
        detail,
        name,
        field,
        mode,
        values,
      );
      continue;
    }

    if (detail && name in detail) {
      values[name] = parseDataFormValue(
        detail[name],
        detail,
        name,
        field,
        mode,
        values,
      );
      continue;
    }

    values[name] = getDataFormDefaultValue(field);
  }

  return values;
}

export function createDataFormPayload(
  fields: DataFormFields,
  mode: Extract<DataFormMode, "create" | "edit">,
  values: DataFormValues,
  detail?: CrudDetail,
): CrudPayload {
  const payload: Record<string, unknown> = {};
  const context = { mode, values, detail };

  for (const [name, field] of getDataFormFieldsForMode(fields, mode)) {
    if (resolveDataFormCondition(field.hidden, { mode, values })) {
      continue;
    }

    const value = values[name] ?? null;
    payload[getDataFormBackendField(name, field)] = field.serialize
      ? field.serialize(value, context)
      : value;
  }

  return payload;
}

export function validateDataFormField(
  field: DataFormFieldDefinition,
  value: DataFormValue,
  mode: DataFormMode,
  values: DataFormValues,
): string | undefined {
  if (mode === "view" || field.readOnly) {
    return undefined;
  }

  if (field.required && isEmptyDataFormValue(value, field)) {
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

  return field.validate?.(value, { mode, values });
}

export function parseDataFormServerErrors(
  error: unknown,
  fields: DataFormFields,
): DataFormServerErrors {
  const body = getErrorBody(error);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      fields: {},
      form: getErrorMessage(error, "Failed to save."),
    };
  }

  const fieldErrors: Record<string, string> = {};
  const formMessages: string[] = [];
  const backendToFrontend = new Map<string, string>();

  for (const [name, field] of Object.entries(fields)) {
    backendToFrontend.set(getDataFormBackendField(name, field), name);
    backendToFrontend.set(name, name);
  }

  for (const [key, value] of Object.entries(body)) {
    const message = normalizeServerMessage(value);

    if (!message) {
      continue;
    }

    if (key === "detail" || key === "non_field_errors") {
      formMessages.push(message);
      continue;
    }

    const frontendName = backendToFrontend.get(key);

    if (frontendName) {
      fieldErrors[frontendName] = message;
    } else {
      formMessages.push(`${key}: ${message}`);
    }
  }

  return {
    fields: fieldErrors,
    form: formMessages.length > 0 ? formMessages.join(" ") : undefined,
  };
}

export function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const body = getErrorBody(error);

  if (body && typeof body === "object" && !Array.isArray(body)) {
    const detail = "detail" in body ? body.detail : undefined;
    const message = normalizeServerMessage(detail);

    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function parseDataFormValue(
  value: unknown,
  detail: CrudDetail,
  _name: string,
  field: DataFormFieldDefinition,
  mode: DataFormMode,
  values: DataFormValues,
): DataFormValue {
  if (field.parse) {
    return field.parse(value, detail, { mode, values });
  }

  return normalizeDataFormValue(value, field);
}

function getDataFormDefaultValue(
  field: DataFormFieldDefinition,
): DataFormValue {
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

function normalizeDataFormValue(
  value: unknown,
  field: DataFormFieldDefinition,
): DataFormValue {
  if (value === null || value === undefined) {
    return getDataFormDefaultValue(field);
  }

  if (field.type === "multiselect") {
    return Array.isArray(value) ? value.filter(isDataFormPrimitive) : [];
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

  if (isDataFormPrimitive(value)) {
    return value;
  }

  return String(value);
}

function isDataFormPrimitive(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isEmptyDataFormValue(
  value: DataFormValue,
  field: DataFormFieldDefinition,
): boolean {
  if (field.type === "checkbox") {
    return value !== true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return value === null || value === "";
}

function getErrorBody(error: unknown): unknown {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("response" in error) {
    const response = error.response;

    if (response && typeof response === "object" && "data" in response) {
      return response.data;
    }
  }

  if ("body" in error) {
    return error.body;
  }

  return undefined;
}

function normalizeServerMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map(normalizeServerMessage)
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(" ") : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, nested]) => {
        const message = normalizeServerMessage(nested);
        return message ? `${key}: ${message}` : undefined;
      })
      .filter((message): message is string => Boolean(message));

    return entries.length > 0 ? entries.join(" ") : undefined;
  }

  return value === null || value === undefined ? undefined : String(value);
}
