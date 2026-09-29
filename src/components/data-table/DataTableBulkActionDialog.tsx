import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { RadioGroup } from "../ui/radio-group";

import styles from "./DataTable.module.css";

import type {
  DataTableBulkAction,
  DataTableBulkScope,
  DataTableFilter,
} from "./DataTable.types";

interface DataTableBulkActionDialogProps {
  action: DataTableBulkAction<unknown>;
  selectedRowIds: Set<string>;
  filters: DataTableFilter[];
  totalCount: number;
  onClose: () => void;
  onSuccess: (action: DataTableBulkAction<unknown>) => void;
}

export function DataTableBulkActionDialog({
  action,
  selectedRowIds,
  filters,
  totalCount,
  onClose,
  onSuccess,
}: DataTableBulkActionDialogProps) {
  const selectedCount = selectedRowIds.size;

  const [scope, setScope] = useState<DataTableBulkScope>(
    selectedCount > 0 ? "selected" : "filtered",
  );
  const [values, setValues] = useState<unknown>(() =>
    typeof action.initialValues === "function"
      ? action.initialValues()
      : action.initialValues,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const target = useMemo(
    () =>
      scope === "selected"
        ? { ids: Array.from(selectedRowIds) }
        : { filters },
    [filters, scope, selectedRowIds],
  );

  const handleClose = () => {
    if (pending) {
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    if (!action || pending || (scope === "selected" && selectedCount === 0)) {
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(true);
    setError(null);

    try {
      await action.onAction({
        target,
        values,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      onSuccess(action);
      onClose();
    } catch (actionError: unknown) {
      if (controller.signal.aborted) {
        return;
      }

      setError(
        actionError instanceof Error ? actionError.message : "Action failed",
      );
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
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>{action.dialogTitle ?? action.label}</Dialog.Title>
          <Dialog.Description>
            Choose which records this action should apply to.
          </Dialog.Description>
        </Dialog.Header>

        <div className={styles.bulkDialogBody}>
          <RadioGroup
            value={scope}
            onValueChange={(value) => setScope(value as DataTableBulkScope)}
          >
            <RadioGroup.Item
              value="selected"
              disabled={selectedCount === 0}
              label="Selected records"
              description={
                selectedCount > 0
                  ? `${selectedCount} selected`
                  : "No records selected"
              }
            />

            <RadioGroup.Item
              value="filtered"
              label="All matching records"
              description={`${totalCount} matching`}
            />
          </RadioGroup>

          {action.renderFields ? (
            <div className={styles.bulkDialogFields}>
              {action.renderFields({
                values,
                setValues,
                scope,
                selectedCount,
                totalCount,
              })}
            </div>
          ) : null}

          {error ? (
            <div className={styles.bulkActionError} role="alert">
              {error}
            </div>
          ) : null}
        </div>

        <Dialog.Footer>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            loading={pending}
            disabled={scope === "selected" && selectedCount === 0}
            onClick={() => void handleSubmit()}
          >
            {action.confirmLabel ?? action.label}
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  );
}
