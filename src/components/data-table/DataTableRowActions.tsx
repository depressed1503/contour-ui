import { MoreHorizontal } from "lucide-react";
import type { RowData } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { Menu } from "../ui/menu";

import type {
  DataTableDefinition,
  DataTableEditorActionConfig,
  DataTableEditorDeleteConfig,
  DataTableRowAction,
} from "./DataTable.types";

interface DataTableRowActionsProps<TData extends RowData> {
  definition: DataTableDefinition<TData>;
  row: TData;
  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
  onRefresh: () => void;
}

export function DataTableRowActions<TData extends RowData>({
  definition,
  row,
  onEdit,
  onDelete,
  onRefresh,
}: DataTableRowActionsProps<TData>) {
  const editor = definition.editor;
  const editConfig = getActionConfig(editor?.edit);
  const deleteConfig = getDeleteConfig(editor?.delete);
  const customActions = (definition.rowActions ?? []).filter(
    (action) => !action.hidden?.(row),
  );
  const canEdit = Boolean(editor?.edit);
  const canDelete = Boolean(editor?.delete);

  if (!canEdit && !canDelete && customActions.length === 0) {
    return null;
  }

  return (
    <Menu>
      <Menu.Trigger
        render={
          <Button type="button" iconOnly variant="ghost" aria-label="Row actions">
            <MoreHorizontal aria-hidden />
          </Button>
        }
      />

      <Menu.Popup>
        {canEdit ? (
          <Menu.Item onClick={() => onEdit(row)}>
            {editConfig?.label ?? "Edit"}
          </Menu.Item>
        ) : null}

        {canEdit && customActions.length > 0 ? <Menu.Separator /> : null}

        {customActions.map((action) => (
          <Menu.Item
            key={action.id}
            disabled={action.disabled?.(row)}
            variant={action.variant === "danger" ? "danger" : "default"}
            onClick={() => {
              void runCustomAction(action, row, onRefresh).catch((error) => {
                console.error(`DataTable row action "${action.id}" failed`, error);
              });
            }}
          >
            {action.label}
          </Menu.Item>
        ))}

        {(canEdit || customActions.length > 0) && canDelete ? (
          <Menu.Separator />
        ) : null}

        {canDelete ? (
          <Menu.Item variant="danger" onClick={() => onDelete(row)}>
            {deleteConfig?.label ?? "Delete"}
          </Menu.Item>
        ) : null}
      </Menu.Popup>
    </Menu>
  );
}

async function runCustomAction<TData>(
  action: DataTableRowAction<TData>,
  row: TData,
  refresh: () => void,
): Promise<void> {
  await action.onAction(row, { refresh });
}

function getActionConfig(
  capability: boolean | DataTableEditorActionConfig | undefined,
): DataTableEditorActionConfig | undefined {
  return capability && capability !== true ? capability : undefined;
}

function getDeleteConfig(
  capability: boolean | DataTableEditorDeleteConfig | undefined,
): DataTableEditorDeleteConfig | undefined {
  return capability && capability !== true ? capability : undefined;
}
