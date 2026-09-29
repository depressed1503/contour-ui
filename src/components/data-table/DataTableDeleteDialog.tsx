import { useEffect, useRef, useState } from "react";

import type { RowData } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

import styles from "./DataTable.module.css";

import type {
  DataTableDefinition,
  DataTableEditorDeleteConfig,
} from "./DataTable.types";

interface DataTableDeleteDialogProps<TData extends RowData> {
  definition: DataTableDefinition<TData>;
  row: TData;
  rowId: string;
  onClose: () => void;
  onSuccess: (rowId: string) => void;
}

export function DataTableDeleteDialog<TData extends RowData>({
  definition,
  row,
  rowId,
  onClose,
  onSuccess,
}: DataTableDeleteDialogProps<TData>) {
  const editor = definition.editor!;
  const config = getDeleteConfig(editor.delete);
  const controllerRef = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const entityLabel = editor.entityLabel ?? "record";
  const rowLabel = editor.getRowLabel?.(row) ?? `#${rowId}`;
  const title = config?.title ?? `Delete ${entityLabel}`;
  const description =
    config?.description ??
    `Delete “${rowLabel}”? This action cannot be undone.`;

  const handleDelete = async () => {
    if (pending) {
      return;
    }

    if (!definition.datasource.delete) {
      setError("This data source does not support deleting records.");
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(true);
    setError(null);

    try {
      await definition.datasource.delete(rowId, controller.signal);

      if (!controller.signal.aborted) {
        onSuccess(rowId);
        onClose();
      }
    } catch (deleteError: unknown) {
      if (!controller.signal.aborted) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete record.",
        );
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (!controller.signal.aborted) {
        setPending(false);
      }
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>

        {error ? (
          <div className={styles.editorSubmitError} role="alert">
            {error}
          </div>
        ) : null}

        <Dialog.Footer>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onClose}
          >
            No
          </Button>

          <Button
            type="button"
            loading={pending}
            onClick={() => void handleDelete()}
          >
            {config?.confirmLabel ?? "Yes, delete"}
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}

function getDeleteConfig(
  capability: boolean | DataTableEditorDeleteConfig | undefined,
): DataTableEditorDeleteConfig | undefined {
  if (!capability || capability === true) {
    return undefined;
  }

  return capability;
}
