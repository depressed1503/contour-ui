import { Check, ChevronDown, X } from "lucide-react";

import { Input } from "../ui/input";

import { Popover } from "../ui/popover";

import { Select } from "../ui/select";

import styles from "./DataTable.module.css";

import type {
  DataTableFilter,
  DataTableFilterConfig,
  DataTableFilterDefinition,
  DataTableFilterOption,
  DataTableFilterPrimitive,
  DataTableFilterValue,
  DataTableRangeValue,
} from "./DataTable.types";

interface DataTableFilterControlProps {
  id: string;

  definition: DataTableFilterDefinition;

  filter?: DataTableFilter;

  onChange: (filter: DataTableFilter | null) => void;
}

export function DataTableFilterControl({
  id,
  definition,
  filter,
  onChange,
}: DataTableFilterControlProps) {
  const config = normalizeFilterDefinition(definition);

  const hasValue = filter !== undefined && !isEmptyFilterValue(filter.value);

  const excluded = hasValue && filter?.operator === "exclude";

  const setValue = (value: DataTableFilterValue | null) => {
    if (value === null || isEmptyFilterValue(value)) {
      onChange(null);

      return;
    }

    onChange({
      id,

      operator: filter?.operator ?? "include",

      value,
    });
  };

  const clear = () => {
    onChange(null);
  };

  const toggleOperator = () => {
    if (!filter || !hasValue) {
      return;
    }

    onChange({
      ...filter,

      operator: filter.operator === "exclude" ? "include" : "exclude",
    });
  };

  return (
    <div className={styles.filter}>
      <div className={styles.filterInput}>
        <FilterInput
          config={config}
          value={filter?.value}
          onChange={setValue}
        />
      </div>

      {hasValue ? (
        <button
          type="button"
          className={styles.filterClear}
          aria-label="Clear filter"
          title="Clear filter"
          onClick={clear}
        >
          <X aria-hidden />
        </button>
      ) : null}

      <button
        type="button"
        className={excluded ? styles.filterNotActive : styles.filterNot}
        disabled={!hasValue}
        aria-label={excluded ? "Disable exclusion" : "Exclude matching values"}
        aria-pressed={excluded}
        title={excluded ? "Include matching values" : "Exclude matching values"}
        onClick={toggleOperator}
      >
        !
      </button>
    </div>
  );
}

interface FilterInputProps {
  config: DataTableFilterConfig;

  value?: DataTableFilterValue;

  onChange: (value: DataTableFilterValue | null) => void;
}

function FilterInput({ config, value, onChange }: FilterInputProps) {
  switch (config.type) {
    case "text":
      return (
        <Input
          className={styles.control}
          value={typeof value === "string" ? value : ""}
          placeholder="Filter..."
          aria-label="Filter"
          onChange={(event) => onChange(event.target.value || null)}
        />
      );

    case "number":
      return (
        <Input
          className={styles.control}
          type="number"
          value={typeof value === "number" ? value : ""}
          placeholder="Filter..."
          aria-label="Filter number"
          onChange={(event) => {
            const raw = event.target.value;

            onChange(raw === "" ? null : Number(raw));
          }}
        />
      );

    case "select":
      return (
        <SelectFilter
          options={config.options}
          value={getPrimitiveValue(value)}
          onChange={onChange}
        />
      );

    case "multiselect":
      return (
        <MultiSelectFilter
          options={config.options}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );

    case "number-range":
      return (
        <NumberRangeFilter
          value={
            isNumberRange(value)
              ? value
              : {
                  from: null,
                  to: null,
                }
          }
          onChange={onChange}
        />
      );

    case "date":
      return (
        <Input
          className={styles.control}
          type="date"
          value={typeof value === "string" ? value : ""}
          aria-label="Filter date"
          onChange={(event) => onChange(event.target.value || null)}
        />
      );

    case "datetime":
      return (
        <Input
          className={styles.control}
          type="datetime-local"
          value={typeof value === "string" ? value : ""}
          aria-label="Filter date and time"
          onChange={(event) => onChange(event.target.value || null)}
        />
      );

    case "date-range":
      return (
        <StringRangeFilter
          type="date"
          value={
            isStringRange(value)
              ? value
              : {
                  from: null,
                  to: null,
                }
          }
          onChange={onChange}
        />
      );

    case "datetime-range":
      return (
        <StringRangeFilter
          type="datetime-local"
          value={
            isStringRange(value)
              ? value
              : {
                  from: null,
                  to: null,
                }
          }
          onChange={onChange}
        />
      );
  }
}

interface SelectFilterProps {
  options: DataTableFilterOption[];

  value: DataTableFilterPrimitive | null;

  onChange: (value: DataTableFilterValue | null) => void;
}

function SelectFilter({ options, value, onChange }: SelectFilterProps) {
  return (
    <Select<DataTableFilterPrimitive>
      items={options}
      value={value}
      onValueChange={(nextValue) => onChange(nextValue ?? null)}
    >
      <Select.Trigger className={styles.control}>
        <Select.Value placeholder="Any" />
      </Select.Trigger>

      <Select.Popup>
        {options.map((option) => (
          <Select.Item key={String(option.value)} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Popup>
    </Select>
  );
}

interface MultiSelectFilterProps {
  options: DataTableFilterOption[];

  value: DataTableFilterPrimitive[];

  onChange: (value: DataTableFilterValue | null) => void;
}

function MultiSelectFilter({
  options,
  value,
  onChange,
}: MultiSelectFilterProps) {
  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  const label =
    selectedOptions.length === 0
      ? "Any"
      : selectedOptions.length === 1
        ? (selectedOptions[0]?.label ?? "1 selected")
        : `${selectedOptions[0]?.label ?? ""}, +${selectedOptions.length - 1}`;

  const toggle = (optionValue: DataTableFilterPrimitive) => {
    const selected = value.includes(optionValue);

    const nextValue = selected
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onChange(nextValue.length > 0 ? nextValue : null);
  };

  return (
    <Popover>
      <Popover.Trigger
        render={
          <button type="button" className={styles.multiSelectTrigger}>
            <span className={styles.multiSelectLabel}>{label}</span>

            <ChevronDown aria-hidden />
          </button>
        }
      />

      <Popover.Popup className={styles.multiSelectPopup}>
        <div
          className={styles.multiSelectOptions}
          role="listbox"
          aria-multiselectable="true"
        >
          {options.map((option) => {
            const selected = value.includes(option.value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={selected}
                className={styles.multiSelectOption}
                onClick={() => toggle(option.value)}
              >
                <span className={styles.multiSelectCheck}>
                  {selected ? <Check aria-hidden /> : null}
                </span>

                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </Popover.Popup>
    </Popover>
  );
}

interface NumberRangeFilterProps {
  value: DataTableRangeValue<number>;

  onChange: (value: DataTableFilterValue | null) => void;
}

function NumberRangeFilter({ value, onChange }: NumberRangeFilterProps) {
  const update = (side: "from" | "to", raw: string) => {
    const next = {
      ...value,

      [side]: raw === "" ? null : Number(raw),
    };

    onChange(isEmptyRange(next) ? null : next);
  };

  return (
    <div className={styles.range}>
      <input
        className={styles.rangeInput}
        type="number"
        value={value.from ?? ""}
        placeholder="From"
        aria-label="From"
        onChange={(event) => update("from", event.target.value)}
      />

      <div className={styles.rangeDivider} />

      <input
        className={styles.rangeInput}
        type="number"
        value={value.to ?? ""}
        placeholder="To"
        aria-label="To"
        onChange={(event) => update("to", event.target.value)}
      />
    </div>
  );
}

interface StringRangeFilterProps {
  type: "date" | "datetime-local";

  value: DataTableRangeValue<string>;

  onChange: (value: DataTableFilterValue | null) => void;
}

function StringRangeFilter({ type, value, onChange }: StringRangeFilterProps) {
  const update = (side: "from" | "to", raw: string) => {
    const next = {
      ...value,

      [side]: raw || null,
    };

    onChange(isEmptyRange(next) ? null : next);
  };

  return (
    <div className={styles.range}>
      <input
        className={styles.rangeInput}
        type={type}
        value={value.from ?? ""}
        aria-label="From"
        onChange={(event) => update("from", event.target.value)}
      />

      <div className={styles.rangeDivider} />

      <input
        className={styles.rangeInput}
        type={type}
        value={value.to ?? ""}
        aria-label="To"
        onChange={(event) => update("to", event.target.value)}
      />
    </div>
  );
}

function normalizeFilterDefinition(
  definition: DataTableFilterDefinition,
): DataTableFilterConfig {
  if (typeof definition !== "string") {
    return definition;
  }

  return {
    type: definition,
  };
}

function getPrimitiveValue(
  value: DataTableFilterValue | undefined,
): DataTableFilterPrimitive | null {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return null;
}

function isEmptyFilterValue(value: DataTableFilterValue): boolean {
  if (typeof value === "string") {
    return value.length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return isEmptyRange(value);
  }

  return false;
}

function isEmptyRange<TValue extends string | number>(
  value: DataTableRangeValue<TValue>,
): boolean {
  return value.from === null && value.to === null;
}

function isNumberRange(
  value: DataTableFilterValue | undefined,
): value is DataTableRangeValue<number> {
  if (!isRangeValue(value)) {
    return false;
  }

  return (
    (value.from === null || typeof value.from === "number") &&
    (value.to === null || typeof value.to === "number")
  );
}

function isStringRange(
  value: DataTableFilterValue | undefined,
): value is DataTableRangeValue<string> {
  if (!isRangeValue(value)) {
    return false;
  }

  return (
    (value.from === null || typeof value.from === "string") &&
    (value.to === null || typeof value.to === "string")
  );
}

function isRangeValue(
  value: DataTableFilterValue | undefined,
): value is DataTableRangeValue<string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "from" in value &&
    "to" in value
  );
}
