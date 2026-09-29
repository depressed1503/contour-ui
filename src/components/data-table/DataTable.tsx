import { useState } from "react";

import type { RowData } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";

import { Button } from "../ui/button";

import { DataTableActionsMenu } from "./DataTableActionsMenu";
import { DataTableBulkActionDialog } from "./DataTableBulkActionDialog";
import { DataTableColumnsMenu } from "./DataTableColumnsMenu";
import { DataTableDeleteDialog } from "./DataTableDeleteDialog";
import { DataTableEditorDialog } from "./DataTableEditorDialog";
import { DataTableEngine } from "./DataTableEngine";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableRowActions } from "./DataTableRowActions";
import { DataTableStatus } from "./DataTableStatus";
import { useDataTable } from "./useDataTable";

import styles from "./DataTable.module.css";

import type {
  DataTableBulkAction,
  DataTableEditorActionConfig,
  DataTableProps,
} from "./DataTable.types";

type EditorState<TData> =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      row: TData;
      rowId: string;
    }
  | null;

interface DeleteState<TData> {
  row: TData;
  rowId: string;
}

export function DataTable<TData extends RowData>({
  definition,
}: DataTableProps<TData>) {
  const table = useDataTable(definition);
  const [activeBulkAction, setActiveBulkAction] =
    useState<DataTableBulkAction<unknown> | null>(null);
  const [editorState, setEditorState] = useState<EditorState<TData>>(null);
  const [deleteState, setDeleteState] = useState<DeleteState<TData> | null>(
    null,
  );

  const hasFilters = table.draftFilters.length > 0;
  const bulkActions = definition.bulkActions ?? [];
  const editor = definition.editor;
  const createConfig = getActionConfig(editor?.create);
  const hasRowActions =
    Boolean(editor?.edit) ||
    Boolean(editor?.delete) ||
    (definition.rowActions?.length ?? 0) > 0;

  const handleBulkActionSuccess = (action: DataTableBulkAction<unknown>) => {
    if (action.clearSelectionOnSuccess !== false) {
      table.clearSelection();
    }

    if (action.refreshOnSuccess !== false) {
      table.refresh();
    }
  };

  const handleEdit = (row: TData) => {
    const rowId = getRowId(definition, row);
    setEditorState({ mode: "edit", row, rowId });
  };

  const handleDelete = (row: TData) => {
    const rowId = getRowId(definition, row);
    setDeleteState({ row, rowId });
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarStart}>
          <DataTableActionsMenu
            actions={bulkActions}
            onActionSelect={setActiveBulkAction}
          />

          {table.selectedCount > 0 ? (
            <span className={styles.selectionCount}>
              {table.selectedCount} selected
            </span>
          ) : null}

          {table.selectedCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={table.clearSelection}
            >
              <X aria-hidden />
              Clear selection
            </Button>
          ) : null}

          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => table.setFilters([])}
            >
              <X aria-hidden />
              Clear filters
            </Button>
          ) : null}
        </div>

        <div className={styles.toolbarEnd}>
          <DataTableColumnsMenu
            columns={definition.columns}
            visibility={table.columnVisibility}
            onVisibilityChange={table.setColumnVisibility}
            onReset={table.resetColumns}
          />

          {editor?.create ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setEditorState({ mode: "create" })}
            >
              <Plus aria-hidden />
              {createConfig?.label ?? `Create ${editor.entityLabel ?? "record"}`}
            </Button>
          ) : null}
        </div>
      </div>

      <DataTableStatus
        loading={table.loading}
        error={table.error}
        onRefresh={table.refresh}
      />

      <DataTableEngine
        data={table.data}
        columns={table.columns}
        columnDefinitions={definition.columns}
        sorting={table.query.sorting}
        filters={table.draftFilters}
        columnVisibility={table.columnVisibility}
        selectionEnabled={table.selectionEnabled}
        selectedRowIds={table.selectedRowIds}
        onSortingChange={table.setSorting}
        onFiltersChange={table.setFilters}
        onColumnVisibilityChange={table.setColumnVisibility}
        onRowSelectionChange={table.setRowSelected}
        onPageSelectionChange={table.setPageSelected}
        getRowId={definition.getRowId}
        renderRowActions={
          hasRowActions
            ? (row) => (
                <DataTableRowActions
                  definition={definition}
                  row={row}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRefresh={table.refresh}
                />
              )
            : undefined
        }
      />

      <DataTablePagination
        page={table.query.page}
        pageSize={table.query.pageSize}
        count={table.count}
        pageSizeOptions={table.pageSizeOptions}
        disabled={table.loading}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
      />

      {activeBulkAction ? (
        <DataTableBulkActionDialog
          key={activeBulkAction.id}
          action={activeBulkAction}
          selectedRowIds={table.selectedRowIds}
          filters={table.datasourceFilters}
          totalCount={table.count}
          onClose={() => setActiveBulkAction(null)}
          onSuccess={handleBulkActionSuccess}
        />
      ) : null}

      {editorState && editor ? (
        <DataTableEditorDialog
          definition={definition}
          mode={editorState.mode}
          row={editorState.mode === "edit" ? editorState.row : undefined}
          rowId={editorState.mode === "edit" ? editorState.rowId : undefined}
          onClose={() => setEditorState(null)}
          onSuccess={table.refresh}
        />
      ) : null}

      {deleteState && editor ? (
        <DataTableDeleteDialog
          definition={definition}
          row={deleteState.row}
          rowId={deleteState.rowId}
          onClose={() => setDeleteState(null)}
          onSuccess={(rowId) => {
            table.setRowSelected(rowId, false);
            table.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function getActionConfig(
  capability: boolean | DataTableEditorActionConfig | undefined,
): DataTableEditorActionConfig | undefined {
  if (!capability || capability === true) {
    return undefined;
  }

  return capability;
}

function getRowId<TData extends RowData>(
  definition: DataTableProps<TData>["definition"],
  row: TData,
): string {
  if (!definition.getRowId) {
    throw new Error(
      `DataTable "${definition.id}": edit/delete row actions require getRowId`,
    );
  }

  return definition.getRowId(row);
}
