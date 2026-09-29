import type { ReactNode } from "react";

import { Checkbox } from "../ui/checkbox";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";

import styles from "./DataTable.module.css";

import type {
  DataTableEditorFieldDefinition,
  DataTableEditorMode,
  DataTableEditorValue,
  DataTableEditorValues,
  DataTableFilterPrimitive,
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
  const control = renderCustom
    ? renderCustom({
        name,
        field: definition,
        mode,
        value,
        values,
        error,
        setValue: onChange,
      })
    : renderDefaultControl(definition, value, error, onBlur, onChange);

  if (definition.type === "checkbox" && !renderCustom) {
    return (
      <Field>
        <label className={styles.editorCheckboxRow}>
          {control}
          <span>{definition.label}</span>
        </label>

        {definition.description ? (
          <Field.Description>{definition.description}</Field.Description>
        ) : null}

        {error ? <Field.Error>{error}</Field.Error> : null}
      </Field>
    );
  }

  return (
    <Field>
      <Field.Label>{definition.label}</Field.Label>

      {control}

      {definition.description ? (
        <Field.Description>{definition.description}</Field.Description>
      ) : null}

      {error ? <Field.Error>{error}</Field.Error> : null}
    </Field>
  );
}

function renderDefaultControl(
  definition: DataTableEditorFieldDefinition,
  value: DataTableEditorValue,
  error: string | undefined,
  onBlur: () => void,
  onChange: (value: DataTableEditorValue) => void,
) {
  switch (definition.type) {
    case "text":
      return (
        <Input
          name={definition.field}
          value={toInputString(value)}
          placeholder={definition.placeholder}
          disabled={definition.disabled}
          invalid={Boolean(error)}
          minLength={definition.minLength}
          maxLength={definition.maxLength}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "textarea":
      return (
        <Textarea
          name={definition.field}
          value={toInputString(value)}
          placeholder={definition.placeholder}
          disabled={definition.disabled}
          invalid={Boolean(error)}
          minLength={definition.minLength}
          maxLength={definition.maxLength}
          rows={definition.rows ?? 4}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value === null || value === "" ? "" : String(value)}
          placeholder={definition.placeholder}
          disabled={definition.disabled}
          invalid={Boolean(error)}
          min={definition.min}
          max={definition.max}
          step={definition.step}
          onBlur={onBlur}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? null : Number(next));
          }}
        />
      );

    case "select": {
      const selectValue = isPrimitive(value) ? value : null;

      return (
        <Select<DataTableFilterPrimitive>
          items={definition.options}
          value={selectValue}
          onValueChange={(nextValue) => onChange(nextValue ?? null)}
          disabled={definition.disabled}
        >
          <Select.Trigger className={error ? styles.editorInvalidSelect : undefined}>
            <Select.Value placeholder={definition.placeholder ?? "Select…"} />
          </Select.Trigger>

          <Select.Popup>
            {definition.options.map((option) => (
              <Select.Item key={String(option.value)} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select>
      );
    }

    case "multiselect": {
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <Select<DataTableFilterPrimitive, true>
          multiple
          items={definition.options}
          value={selectedValues}
          onValueChange={(nextValue) => onChange(nextValue ?? [])}
          disabled={definition.disabled}
        >
          <Select.Trigger className={error ? styles.editorInvalidSelect : undefined}>
            <Select.Value placeholder={definition.placeholder ?? "Select…"} />
          </Select.Trigger>

          <Select.Popup>
            {definition.options.map((option) => (
              <Select.Item key={String(option.value)} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select>
      );
    }

    case "checkbox":
      return (
        <Checkbox
          checked={value === true}
          disabled={definition.disabled}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={toInputString(value)}
          disabled={definition.disabled}
          invalid={Boolean(error)}
          min={definition.min}
          max={definition.max}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "datetime":
      return (
        <Input
          type="datetime-local"
          value={toInputString(value)}
          disabled={definition.disabled}
          invalid={Boolean(error)}
          min={definition.min}
          max={definition.max}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

function toInputString(value: DataTableEditorValue): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function isPrimitive(value: DataTableEditorValue): value is DataTableFilterPrimitive {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
