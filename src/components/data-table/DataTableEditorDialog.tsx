import { useEffect, useMemo, useRef, useState } from "react";

import { useForm } from "@tanstack/react-form";
import type { RowData } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { resolveDataFormCondition } from "../data-form/DataForm.utils";

import { DataTableEditorField } from "./DataTableEditorField";
import {
  createEditorPayload,
  createEditorValues,
  getEditorFieldsForMode,
  validateEditorField,
} from "./DataTableEditor.utils";

import styles from "./DataTable.module.css";

import type {
  DataTableDefinition,
  DataTableDetail,
  DataTableEditorActionConfig,
  DataTableEditorMode,
  DataTableEditorValue,
  DataTableEditorValues,
} from "./DataTable.types";

interface DataTableEditorDialogProps<TData extends RowData> {
  definition: DataTableDefinition<TData>;
  mode: DataTableEditorMode;
  row?: TData;
  rowId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DataTableEditorDialog<TData extends RowData>({
  definition,
  mode,
  row,
  rowId,
  onClose,
  onSuccess,
}: DataTableEditorDialogProps<TData>) {
  const editor = definition.editor;
  const [detail, setDetail] = useState<DataTableDetail | undefined>();
  const [loading, setLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadVersion, setLoadVersion] = useState(0);

  const unsupportedLoadError =
    mode === "edit" && (!rowId || !definition.datasource.getOne)
      ? "This data source does not support loading a record by id."
      : null;

  useEffect(() => {
    if (mode !== "edit" || !rowId || !definition.datasource.getOne) {
      return;
    }

    const controller = new AbortController();

    definition.datasource
      .getOne(rowId, controller.signal)
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
  }, [definition.datasource, mode, rowId, loadVersion]);

  if (!editor) {
    return null;
  }

  const actionConfig = getActionConfig(
    mode === "create" ? editor.create : editor.edit,
  );
  const entityLabel = editor.entityLabel ?? "record";
  const title =
    actionConfig?.title ??
    (mode === "create" ? `Create ${entityLabel}` : `Edit ${entityLabel}`);
  const description =
    actionConfig?.description ??
    (mode === "create"
      ? `Enter the ${entityLabel} details below.`
      : `Update the ${entityLabel} details below.`);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>

        {loading ? (
          <div className={styles.editorStatus} role="status">
            Loading…
          </div>
        ) : loadError || unsupportedLoadError ? (
          <div className={styles.editorLoadError} role="alert">
            <span>{loadError ?? unsupportedLoadError}</span>
            {!unsupportedLoadError ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  setLoadError(null);
                  setLoadVersion((version) => version + 1);
                }}
              >
                Retry
              </Button>
            ) : null}
          </div>
        ) : (
          <DataTableEditorForm
            key={`${mode}-${rowId ?? "new"}-${loadVersion}`}
            definition={definition}
            mode={mode}
            row={row}
            rowId={rowId}
            detail={detail}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </Dialog.Popup>
    </Dialog>
  );
}

interface DataTableEditorFormProps<TData extends RowData> {
  definition: DataTableDefinition<TData>;
  mode: DataTableEditorMode;
  row?: TData;
  rowId?: string;
  detail?: DataTableDetail;
  onClose: () => void;
  onSuccess: () => void;
}

function DataTableEditorForm<TData extends RowData>({
  definition,
  mode,
  row,
  rowId,
  detail,
  onClose,
  onSuccess,
}: DataTableEditorFormProps<TData>) {
  const editor = definition.editor!;
  const controllerRef = useRef<AbortController | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => createEditorValues(editor.fields, mode, detail),
    [detail, editor.fields, mode],
  );

  const visibleFields = useMemo(
    () => getEditorFieldsForMode(editor.fields, mode),
    [editor.fields, mode],
  );

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }: { value: DataTableEditorValues }) => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setSubmitError(null);

      try {
        const payload = createEditorPayload(
          editor.fields,
          mode,
          value as DataTableEditorValues,
        );

        if (mode === "create") {
          if (!definition.datasource.create) {
            throw new Error("This data source does not support creating records.");
          }

          await definition.datasource.create(payload, controller.signal);
        } else {
          if (!rowId || !definition.datasource.update) {
            throw new Error("This data source does not support updating records.");
          }

          await definition.datasource.update(rowId, payload, controller.signal);
        }

        if (controller.signal.aborted) {
          return;
        }

        onSuccess();
        onClose();
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setSubmitError(getErrorMessage(error, "Failed to save record."));
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
  });

  return (
    <form
      className={styles.editorForm}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state: { values: DataTableEditorValues }) => state.values}
      >
        {(values: DataTableEditorValues) => (
          <div className={styles.editorFields}>
            {visibleFields.map(([name, fieldDefinition]) => {
              if (
                resolveDataFormCondition(fieldDefinition.hidden, {
                  mode,
                  values,
                })
              ) {
                return null;
              }

              return (
                <form.Field
                  key={name}
                  name={name}
                  validators={{
                    onBlur: ({ value }: { value: unknown }) =>
                      validateEditorField(
                        fieldDefinition,
                        value as DataTableEditorValue,
                        mode,
                        form.state.values as DataTableEditorValues,
                      ),
                    onSubmit: ({ value }: { value: unknown }) =>
                      validateEditorField(
                        fieldDefinition,
                        value as DataTableEditorValue,
                        mode,
                        form.state.values as DataTableEditorValues,
                      ),
                  }}
                >
                  {(field: EditorFieldApi) => {
                    const error = getFieldError(field.state.meta.errors);

                    return (
                      <DataTableEditorField
                        name={name}
                        definition={fieldDefinition}
                        mode={mode}
                        value={field.state.value as DataTableEditorValue}
                        values={values}
                        error={error}
                        onBlur={field.handleBlur}
                        onChange={(nextValue) => field.handleChange(nextValue)}
                        renderCustom={editor.renderField?.[name]}
                      />
                    );
                  }}
                </form.Field>
              );
            })}
          </div>
        )}
      </form.Subscribe>

      {editor.renderAfter ? (
        <form.Subscribe
          selector={(state: { values: DataTableEditorValues }) => state.values}
        >
          {(values: DataTableEditorValues) => (
            <div className={styles.editorAfter}>
              {editor.renderAfter?.({
                mode,
                values: values as DataTableEditorValues,
                row,
              })}
            </div>
          )}
        </form.Subscribe>
      ) : null}

      {submitError ? (
        <div className={styles.editorSubmitError} role="alert">
          {submitError}
        </div>
      ) : null}

      <Dialog.Footer>
        <form.Subscribe
          selector={(state: { isSubmitting: boolean }) => state.isSubmitting}
        >
          {(isSubmitting: boolean) => (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button type="submit" loading={isSubmitting}>
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </>
          )}
        </form.Subscribe>
      </Dialog.Footer>
    </form>
  );
}


interface EditorFieldApi {
  state: {
    value: unknown;
    meta: {
      errors: unknown[];
    };
  };
  handleBlur: () => void;
  handleChange: (value: DataTableEditorValue) => void;
}

function getActionConfig(
  capability: boolean | DataTableEditorActionConfig | undefined,
): DataTableEditorActionConfig | undefined {
  if (!capability || capability === true) {
    return undefined;
  }

  return capability;
}

function getFieldError(errors: unknown[]): string | undefined {
  const first = errors.find((error) => error !== undefined && error !== null);

  if (typeof first === "string") {
    return first;
  }

  if (first && typeof first === "object" && "message" in first) {
    const message = first.message;
    return typeof message === "string" ? message : String(message);
  }

  return first === undefined ? undefined : String(first);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
