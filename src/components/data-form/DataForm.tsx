import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { useForm } from "@tanstack/react-form";

import { Button } from "../ui/button";
import { cn } from "../../lib/cn";
import { DataFormField } from "./DataFormField";
import {
  createDataFormPayload,
  createDataFormValues,
  getDataFormFieldsForMode,
  getErrorMessage,
  parseDataFormServerErrors,
  resolveDataFormCondition,
  validateDataFormField,
} from "./DataForm.utils";
import styles from "./DataForm.module.css";

import type { CrudDetail } from "../../lib/crud";
import type {
  DataFormDefinition,
  DataFormProps,
  DataFormServerErrors,
  DataFormValue,
  DataFormValues,
} from "./DataForm.types";

export function DataForm<
  TItem,
  TDetail extends CrudDetail = CrudDetail,
>({
  definition,
  mode,
  id,
  initialValues,
  className,
  onCancel,
  onSuccess,
}: DataFormProps<TItem, TDetail>) {
  const [detail, setDetail] = useState<TDetail | undefined>();
  const [loading, setLoading] = useState(mode !== "create");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadVersion, setLoadVersion] = useState(0);

  const needsDetail = mode === "edit" || mode === "view";
  const unsupportedLoadError =
    needsDetail && (id === undefined || !definition.datasource.getOne)
      ? "This data source does not support loading a record by id."
      : null;

  useEffect(() => {
    if (!needsDetail || id === undefined || !definition.datasource.getOne) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    definition.datasource
      .getOne(String(id), controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setDetail(result);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(getErrorMessage(error, "Failed to load record."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [definition.datasource, id, loadVersion, needsDetail]);

  if (loading) {
    return (
      <div className={cn(styles.root, className)} role="status">
        <div className={styles.status}>Loading…</div>
      </div>
    );
  }

  if (loadError || unsupportedLoadError) {
    return (
      <div className={cn(styles.root, className)}>
        <div className={styles.errorBox} role="alert">
          <span>{loadError ?? unsupportedLoadError}</span>
          {!unsupportedLoadError ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setLoadVersion((version) => version + 1)}
            >
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <DataFormBody
      key={`${definition.id}-${mode}-${String(id ?? "new")}-${loadVersion}`}
      definition={definition}
      mode={mode}
      id={id}
      detail={detail}
      initialValues={initialValues}
      className={className}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}

interface DataFormBodyProps<
  TItem,
  TDetail extends CrudDetail,
> extends Omit<DataFormProps<TItem, TDetail>, "definition"> {
  definition: DataFormDefinition<TItem, TDetail>;
  detail?: TDetail;
}

function DataFormBody<
  TItem,
  TDetail extends CrudDetail,
>({
  definition,
  mode,
  id,
  detail,
  initialValues,
  className,
  onCancel,
  onSuccess,
}: DataFormBodyProps<TItem, TDetail>) {
  const controllerRef = useRef<AbortController | null>(null);
  const [serverErrors, setServerErrors] = useState<DataFormServerErrors>({
    fields: {},
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues = useMemo(
    () =>
      createDataFormValues(
        definition.fields,
        mode,
        detail,
        initialValues,
      ),
    [definition.fields, detail, initialValues, mode],
  );

  const fieldsForMode = useMemo(
    () => getDataFormFieldsForMode(definition.fields, mode),
    [definition.fields, mode],
  );

  useEffect(() => () => controllerRef.current?.abort(), []);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }: { value: DataFormValues }) => {
      if (mode === "view") {
        return;
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setServerErrors({ fields: {} });
      setSuccessMessage(null);

      try {
        const values = value as DataFormValues;
        const payload = createDataFormPayload(
          definition.fields,
          mode,
          values,
          detail,
        );

        let item: TItem;

        if (mode === "create") {
          if (!definition.datasource.create) {
            throw new Error("This data source does not support creating records.");
          }

          item = await definition.datasource.create(payload, controller.signal);
        } else {
          if (id === undefined || !definition.datasource.update) {
            throw new Error("This data source does not support updating records.");
          }

          item = await definition.datasource.update(
            String(id),
            payload,
            controller.signal,
          );
        }

        if (controller.signal.aborted) {
          return;
        }

        setSuccessMessage(mode === "create" ? "Created successfully." : "Saved successfully.");
        onSuccess?.({ mode, item, values });
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setServerErrors(parseDataFormServerErrors(error, definition.fields));
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
  });

  const columns = Math.max(1, definition.layout?.columns ?? 1);

  return (
    <form
      className={cn(styles.root, className)}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Subscribe selector={(state: { values: DataFormValues }) => state.values}>
        {(values: DataFormValues) => (
          <>
            <div
              className={styles.fields}
              style={{ "--data-form-columns": columns } as CSSProperties}
            >
              {fieldsForMode.map(([name, fieldDefinition]) => {
                const context = { mode, values };

                if (resolveDataFormCondition(fieldDefinition.hidden, context)) {
                  return null;
                }

                const disabled =
                  mode === "view" ||
                  fieldDefinition.readOnly === true ||
                  resolveDataFormCondition(fieldDefinition.disabled, context);

                return (
                  <div
                    key={name}
                    className={styles.fieldSlot}
                    style={{
                      gridColumn: `span ${Math.min(
                        Math.max(1, fieldDefinition.span ?? 1),
                        columns,
                      )}`,
                    }}
                  >
                    <form.Field
                      name={name}
                      validators={{
                        onBlur: ({ value }: { value: unknown }) =>
                          validateDataFormField(
                            fieldDefinition,
                            value as DataFormValue,
                            mode,
                            form.state.values as DataFormValues,
                          ),
                        onSubmit: ({ value }: { value: unknown }) =>
                          validateDataFormField(
                            fieldDefinition,
                            value as DataFormValue,
                            mode,
                            form.state.values as DataFormValues,
                          ),
                      }}
                    >
                      {(field: DataFormFieldApi) => {
                        const localError = getFieldError(field.state.meta.errors);
                        const error = localError ?? serverErrors.fields[name];

                        return (
                          <DataFormField
                            name={name}
                            definition={fieldDefinition}
                            mode={mode}
                            value={field.state.value as DataFormValue}
                            values={form.state.values as DataFormValues}
                            error={error}
                            disabled={disabled}
                            onBlur={field.handleBlur}
                            onChange={(nextValue) => {
                              if (serverErrors.fields[name]) {
                                setServerErrors((current) => {
                                  const nextFields = { ...current.fields };
                                  delete nextFields[name];
                                  return { ...current, fields: nextFields };
                                });
                              }

                              field.handleChange(nextValue);
                            }}
                          />
                        );
                      }}
                    </form.Field>
                  </div>
                );
              })}
            </div>

            {definition.renderAfter ? (
              <div className={styles.after}>
                {definition.renderAfter({ mode, values })}
              </div>
            ) : null}
          </>
        )}
      </form.Subscribe>

      {serverErrors.form ? (
        <div className={styles.errorBox} role="alert">
          {serverErrors.form}
        </div>
      ) : null}

      {successMessage ? (
        <div className={styles.successBox} role="status">
          {successMessage}
        </div>
      ) : null}

      {mode !== "view" || onCancel ? (
        <div className={styles.actions}>
          {onCancel ? (
            <Button type="button" variant="secondary" onClick={onCancel}>
              {definition.cancelLabel ?? "Cancel"}
            </Button>
          ) : null}

          {mode !== "view" ? (
            <form.Subscribe selector={(state: { isSubmitting: boolean }) => state.isSubmitting}>
              {(isSubmitting: boolean) => (
                <Button type="submit" loading={isSubmitting}>
                  {mode === "create"
                    ? definition.createLabel ?? "Create"
                    : definition.saveLabel ?? "Save"}
                </Button>
              )}
            </form.Subscribe>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

interface DataFormFieldApi {
  state: {
    value: unknown;
    meta: {
      errors: unknown[];
    };
  };
  handleBlur: () => void;
  handleChange: (value: DataFormValue) => void;
}

function getFieldError(errors: unknown[]): string | undefined {
  const first = errors.find((error) => error !== undefined && error !== null);

  if (typeof first === "string") {
    return first;
  }

  if (first && typeof first === "object" && "message" in first) {
    const message = first.message;
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}
