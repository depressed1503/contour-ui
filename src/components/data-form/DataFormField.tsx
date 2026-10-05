import type { ReactNode } from "react";

import { Checkbox } from "../ui/checkbox";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";

import styles from "./DataForm.module.css";

import type {
  DataFormFieldDefinition,
  DataFormMode,
  DataFormValue,
  DataFormValues,
} from "./DataForm.types";

interface DataFormFieldProps {
  name: string;
  definition: DataFormFieldDefinition;
  mode: DataFormMode;
  value: DataFormValue;
  values: DataFormValues;
  error?: string;
  disabled: boolean;
  onBlur: () => void;
  onChange: (value: DataFormValue) => void;
}

export function DataFormField({
  name,
  definition,
  mode,
  value,
  values,
  error,
  disabled,
  onBlur,
  onChange,
}: DataFormFieldProps) {
  const renderCustom = definition.render;
  const control = renderCustom
    ? renderCustom({
        name,
        field: definition,
        mode,
        value,
        values,
        error,
        disabled,
        setValue: onChange,
      })
    : renderDefaultControl(
        definition,
        value,
        error,
        disabled,
        onBlur,
        onChange,
      );

  if (definition.type === "checkbox" && !renderCustom) {
    return (
      <Field>
        <label className={styles.checkboxRow}>
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
  definition: DataFormFieldDefinition,
  value: DataFormValue,
  error: string | undefined,
  disabled: boolean,
  onBlur: () => void,
  onChange: (value: DataFormValue) => void,
): ReactNode {
  switch (definition.type) {
    case "text":
      return (
        <Input
          value={toInputString(value)}
          placeholder={definition.placeholder}
          disabled={disabled}
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
          value={toInputString(value)}
          placeholder={definition.placeholder}
          disabled={disabled}
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
          disabled={disabled}
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
        <Select<string | number | boolean>
          items={definition.options}
          value={selectValue}
          disabled={disabled}
          onValueChange={(nextValue) => onChange(nextValue ?? null)}
        >
          <Select.Trigger>
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
      const selectValue = Array.isArray(value) ? value : [];

      return (
        <Select<string | number | boolean, true>
          multiple
          items={definition.options}
          value={selectValue}
          disabled={disabled}
          onValueChange={(nextValue) => onChange(nextValue ?? [])}
        >
          <Select.Trigger>
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
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={toInputString(value)}
          disabled={disabled}
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
          disabled={disabled}
          invalid={Boolean(error)}
          min={definition.min}
          max={definition.max}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

function toInputString(value: DataFormValue): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function isPrimitive(value: DataFormValue): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
