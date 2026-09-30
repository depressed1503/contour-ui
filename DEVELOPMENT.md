# DataTable maintainer guide

This document is for developers changing the DataTable itself rather than only consuming it.

## Architecture

The intended dependency direction is:

```text
Application definition
        ↓
DataTable orchestration
        ↓
TanStack Table / TanStack Form logic
        ↓
Contour UI primitives
        ↓
Base UI / native HTML
```

The UI Kit owns visual language. The DataTable owns reusable table/editor behavior. Application code owns business rules and backend-specific actions.

Avoid pushing DataTable state or business rules into low-level UI primitives.

## File map

### Public entry points

`src/components/data-table/index.ts`

Public exports. If a consumer should not depend on a symbol, do not export it here.

`src/components/data-table/defineDataTable.ts`

Identity helper that preserves inference for a definition.

`src/components/data-table/DataTable.types.ts`

Public contracts and shared internal types: datasource, columns, filters, bulk actions, editor fields, row actions and component props.

### Data access

`src/components/data-table/createCrudApi.ts`

DRF-oriented datasource adapter. Owns list query serialization and standard CRUD HTTP calls. It must not know about React UI.

`src/components/data-table/useDataTable.ts`

Main list-state orchestration: data loading, URL state, filtering debounce, selection, refresh and column preferences. It maps frontend sort/filter ids to backend field names before calling the datasource.

### List/table rendering

`src/components/data-table/DataTable.tsx`

High-level composition. Connects toolbar, table engine, pagination, bulk action modal and CRUD dialogs.

`src/components/data-table/DataTableEngine.tsx`

TanStack Table integration and table markup. It renders headers, sorting, filter row, data rows, selection and the row-actions cell.

`src/components/data-table/DataTable.features.ts`

TanStack Table feature configuration. Treat changes here carefully because the project uses TanStack Table v9 APIs.

`src/components/data-table/DataTableFilterControl.tsx`

Filter control rendering and include/exclude behavior.

`src/components/data-table/DataTablePagination.tsx`

Pagination presentation.

`src/components/data-table/DataTableStatus.tsx`

List loading/error state.

### Display preferences and URL state

`src/components/data-table/DataTableUrlState.ts`

Reads/writes page, page size, sorting and filters from the browser URL.

`src/components/data-table/DataTableColumnPreferences.ts`

Persistent display preferences stored in localStorage.

`src/components/data-table/DataTableColumnsMenu.tsx`

Columns visibility UI.

### Bulk actions

`src/components/data-table/DataTableActionsMenu.tsx`

Always-visible Actions menu.

`src/components/data-table/DataTableBulkActionDialog.tsx`

Chooses Selected vs All matching filters and renders optional action-specific fields.

### CRUD editor

`src/components/data-table/DataTableEditorDialog.tsx`

Loads detail data for Edit, creates the TanStack Form instance, submits POST/PATCH, renders generated fields and handles mutation-level errors.

`src/components/data-table/DataTableEditorField.tsx`

Maps editor field definitions to Contour UI controls.

`src/components/data-table/DataTableEditor.utils.ts`

Pure editor helpers: snake_case mapping, initial values, payload generation and validation.

`src/components/data-table/DataTableDeleteDialog.tsx`

Generated Yes/No delete confirmation and datasource DELETE call.

`src/components/data-table/DataTableRowActions.tsx`

Generated Edit/Delete menu items plus application-defined custom row actions.

### Shared styles

`src/components/data-table/DataTable.module.css`

All DataTable-specific styles. Visual primitives should stay in their own UI component folders rather than being reimplemented here.

## Data flow

### List query

```text
URL/local state
  ↓
useDataTable
  ↓
frontend ids
  ↓
field mapping
  ↓
DataTableQuery with backend ids
  ↓
datasource.getList()
```

Do not store backend field names in the browser URL. URLs should remain coupled to the frontend definition, not to the transport layer.

### Edit flow

```text
row action Edit
  ↓
getRowId(row)
  ↓
datasource.getOne(id)
  ↓
backend detail object
  ↓
createEditorValues()
  ↓
TanStack Form
  ↓
createEditorPayload()
  ↓
datasource.update(id, payload)
  ↓
refresh list
```

### Create flow

```text
Create button
  ↓
field defaults
  ↓
TanStack Form
  ↓
createEditorPayload()
  ↓
datasource.create(payload)
  ↓
refresh current page
```

## Adding a new editor field type

Example: adding `color`.

### 1. Extend the type union

In `DataTable.types.ts`, add the new discriminator to `DataTableEditorFieldBase["type"]` and add a dedicated interface:

```ts
export interface DataTableEditorColorField extends DataTableEditorFieldBase {
  type: "color";
}
```

Add it to `DataTableEditorFieldDefinition` and export it from `index.ts` if consumers need to name the type.

### 2. Define the default value and detail normalization

Update `DataTableEditor.utils.ts`:

- `getEditorDefaultValue()` if the type needs a non-empty default shape;
- `normalizeEditorValue()` if backend data needs conversion;
- `validateEditorField()` if it has built-in rules.

Keep these functions transport-agnostic. They should not import React.

### 3. Render the control

Add a case to `renderDefaultControl()` in `DataTableEditorField.tsx`:

```tsx
case "color":
  return (
    <ColorInput
      value={String(value ?? "")}
      onChange={onChange}
    />
  );
```

If the control is generally reusable outside DataTable, build it first in `src/components/ui/` and use that primitive here.

Do not add application-specific controls directly to the DataTable core. Use `editor.renderField` for one-off business controls.

### 4. Document it

Add the new type to the editor field section in `README.md`, including one consumer example.

### 5. Exercise create and edit

Test both directions:

```text
backend detail -> form value
form value -> backend payload
```

A field type is incomplete if only Create or only Edit works.

## Adding a new filter type

The main touch points are:

1. `DataTable.types.ts` — add the filter discriminator and config type.
2. `DataTableFilterControl.tsx` — render the control and normalize its value.
3. `DataTableUrlState.ts` — parse and serialize the value.
4. `createCrudApi.ts` — only if its transport representation differs from existing scalar/array/range serialization.
5. `README.md` — document the public API.

Remember that filter state uses frontend column ids until `useDataTable` maps it for the datasource.

## Adding a new datasource capability

Keep datasource capabilities in `DataTableDataSource` and implement DRF behavior in `createCrudApi`.

Do not call `fetch` directly from `DataTable.tsx` or editor components. Components should depend on datasource methods, so another application can supply a non-DRF datasource.

## Changing editor payload mapping

Mapping is centralized in `DataTableEditor.utils.ts`.

Default rule:

```text
frontend editor key -> snake_case backend field
```

Explicit `field` wins over automatic conversion.

Example:

```text
company -> company_id
```

Do not spread field-name conversion across input components or dialogs.

## Validation rules

TanStack Form owns field/form lifecycle. Our editor definition owns validation policy.

Built-in validation belongs in `validateEditorField()` when it is generic across applications. Business-specific validation belongs in a field's `validate` callback.

Do not add domain-specific rules such as “status cannot become archived when invoices exist” to the DataTable package.

## Custom controls and escape hatches

Prefer this order:

1. built-in generated field;
2. `editor.renderField` for one field;
3. `editor.renderAfter` for a preview or extra block;
4. application-owned custom workflow if the whole interaction is domain-specific.

Avoid growing the editor config with many one-off props just to avoid writing a small custom renderer.

## Row actions

Generated Edit/Delete actions come from `editor.edit` and `editor.delete`.

Application-specific actions belong in `definition.rowActions`.

If a custom action needs a large workflow or modal, keep that state in an application component rather than teaching the generic row-action menu every business case.

## Bulk action invariants

Bulk scope is chosen only after selecting an action.

The action target is always one of:

```ts
{ ids: string[] }
```

or:

```ts
{ filters: DataTableFilter[] }
```

Do not reintroduce a persistent “all matching selected” table state. The table selection model should remain a simple set of explicit row ids.

## UI Kit boundary

Use existing Contour UI components from `src/components/ui/` for buttons, fields, dialogs, menus, selects and similar presentation.

Create a new primitive when:

- it is reusable outside DataTable;
- it describes visual/interaction language rather than table business logic.

Keep it inside `data-table/` when:

- it only makes sense as DataTable orchestration;
- it depends on DataTable definitions, queries or datasource contracts.

## TanStack boundaries

TanStack Table owns table mechanics. TanStack Form owns form state/validation mechanics. Neither should become part of the application-facing API unless necessary.

This project currently uses TanStack Table v9, so do not copy v8-only examples such as `useReactTable()` or `getCoreRowModel()` without checking the installed API.

## Public API discipline

Before exporting a new symbol from `index.ts`, ask whether an application consumer actually needs it.

Internal components should stay internal so their props can change without migrating every CRUD page.

The primary stable surface should remain:

```tsx
<DataTable definition={definition} />
```

plus definition/data-source helper types.

## Checklist before merging DataTable changes

- run `npm install` after dependency changes;
- run `npm run build`;
- run `npm run lint`;
- test list loading, retry and abort behavior;
- test sorting and every changed filter in the URL;
- test column visibility persistence;
- test explicit selection across pages;
- test bulk actions for both Selected and All matching;
- test Create, Edit detail loading, PATCH and Delete;
- test custom validation;
- test `field` mapping in both detail and mutation payload directions;
- update `README.md` and this file when the extension model changes.

## Building and packing the UI library

The repository is both a local demo project and an npm library source. The npm package entry point is `src/index.ts`.

Library build pipeline:

```text
src/index.ts
    ↓
tsc -p tsconfig.lib.json
    ↓
dist/*.d.ts

src/index.ts
    ↓
Vite library mode
    ↓
dist/index.js + dist/styles.css
    ↓
npm pack
    ↓
company-ui-<version>.tgz
```

Relevant files:

- `src/index.ts` — public root API of `@company/ui`.
- `vite.config.ts` — Vite library-mode bundle configuration.
- `tsconfig.lib.json` — declaration-only TypeScript build for package consumers.
- `package.json` — npm exports, peer dependencies, packaged files and `pack:local` script.
- `src/components/data-table/index.ts` — public API boundary of DataTable.
- `src/components/ui/*/index.ts` — public API boundary of each UI primitive.

To create the package:

```bash
npm run pack:local
```

Before adding a new public component, make sure its component props/types are exported from the component directory `index.ts`, then re-export the directory from `src/index.ts`.

React and ReactDOM are peer dependencies so a consuming application uses its own React runtime. Base UI, TanStack Form, TanStack Table and Lucide are regular dependencies and are installed with the package. They are externalized from the generated JavaScript bundle to avoid embedding duplicate copies in `dist/index.js`.
