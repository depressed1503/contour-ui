# Contour UI maintainer guide

This document is for developers extending the UI library itself.

## Architecture

The intended dependency direction is:

```text
Application
   ↓
definitions / datasource adapters
   ↓
DataTable / DataForm
   ↓
TanStack Table / TanStack Form
   ↓
Contour UI primitives
   ↓
Base UI / native HTML
```

Application-specific Axios configuration stays in the application. Contour UI receives a ready client through `createCrudApi({ axios })`.

Do not import an application's `axiosConfig.ts`, environment variables, cookies, authentication logic, or business APIs from the library.

## Shared CRUD datasource

`src/lib/crud.ts`

Defines the transport-neutral mutation/detail contract shared by DataTable and DataForm:

```text
getOne
create
update
delete
```

`src/components/data-table/DataTable.types.ts` extends that contract with `getList`.

`src/components/data-table/createCrudApi.ts` is the DRF/Axios adapter. It serializes DataTable query state and delegates HTTP behavior to the Axios instance supplied by the host application.

Because the Axios type is structural, Contour UI does not need an Axios runtime dependency.

## DataForm file map

`src/components/data-form/DataForm.types.ts`

Public DataForm contract: modes, values, field definitions, conditions, layout, validation, parse/serialize hooks and render contexts.

`src/components/data-form/defineDataForm.ts`

Identity helper for inference and public definition authoring.

`src/components/data-form/DataForm.tsx`

Form orchestration. Owns detail loading, TanStack Form lifecycle, submit state, server errors, create/update calls, view mode and layout composition.

`src/components/data-form/DataFormField.tsx`

Maps generic field definitions to Contour UI primitives.

`src/components/data-form/DataForm.utils.ts`

Pure form logic: snake_case mapping, initial values, payload creation, conditions, validation and DRF/Axios server-error normalization.

`src/components/data-form/DataForm.module.css`

Generated-form layout and status styles.

`src/components/data-form/index.ts`

Public DataForm exports.

## DataTable file map

`src/components/data-table/DataTable.types.ts`

Public table contracts. Editor field types are aliases to the shared DataForm field model.

`src/components/data-table/useDataTable.ts`

List loading, URL state, filter debounce, selection, refresh and column preferences.

`src/components/data-table/DataTable.tsx`

High-level composition of toolbar, engine, pagination, bulk actions and CRUD dialogs.

`src/components/data-table/DataTableEngine.tsx`

TanStack Table integration and table rendering.

`src/components/data-table/DataTableFilterControl.tsx`

Filter controls and include/exclude behavior.

`src/components/data-table/DataTableUrlState.ts`

URL serialization for pagination, sorting and filters.

`src/components/data-table/DataTableColumnPreferences.ts`

LocalStorage column preferences.

`src/components/data-table/DataTableActionsMenu.tsx`

Always-visible bulk Actions menu.

`src/components/data-table/DataTableBulkActionDialog.tsx`

Selected IDs vs all filtered records and optional action-specific fields.

`src/components/data-table/DataTableEditorDialog.tsx`

Generated DataTable Create/Edit dialog. It uses the shared DataForm field definitions and shared field renderer.

`src/components/data-table/DataTableEditorField.tsx`

Compatibility wrapper around the shared `DataFormField` renderer. It keeps support for the old `editor.renderField` extension point.

`src/components/data-table/DataTableEditor.utils.ts`

Compatibility wrappers around shared DataForm utility functions.

`src/components/data-table/DataTableDeleteDialog.tsx`

Generated delete confirmation.

`src/components/data-table/DataTableRowActions.tsx`

Generated Edit/Delete actions plus custom row actions.

## Adding a new form/editor field type

Field types are now shared between standalone DataForm and DataTable editors. Do not implement the same type separately in the table.

Example: add `color`.

### 1. Extend the public field union

Edit `src/components/data-form/DataForm.types.ts`.

Add the discriminator to `DataFormFieldBase["type"]` and define a dedicated interface:

```ts
export interface DataFormColorField extends DataFormFieldBase {
  type: "color";
}
```

Add it to `DataFormFieldDefinition` and export it from `src/components/data-form/index.ts`.

If consumers need the legacy DataTable-specific type name, add an alias in `DataTable.types.ts` and export that alias from `data-table/index.ts`.

### 2. Define normalization/default behavior

Edit `src/components/data-form/DataForm.utils.ts` only if the new type needs special handling.

Typical touch points:

```text
getDataFormDefaultValue
normalizeDataFormValue
validateDataFormField
```

Do not put React code in this file.

### 3. Render the field

Edit `src/components/data-form/DataFormField.tsx` and add a `case` to `renderDefaultControl()`.

If the control is useful outside generated forms, first build a reusable primitive under:

```text
src/components/ui/<component>/
```

Then use that primitive in DataForm.

### 4. Verify all three modes

Test:

```text
create: form -> payload
edit: detail -> form -> payload
view: detail -> disabled/read-only presentation
```

Also verify conditional `hidden` / `disabled` behavior if relevant.

### 5. Add a playground example

Update `src/App.tsx` so the new type is easy to manually inspect.

### 6. Update README

Document the public field API and at least one consumer example.

## Adding a new filter type

Main touch points:

1. `DataTable.types.ts` — discriminator/config type.
2. `DataTableFilterControl.tsx` — control rendering.
3. `DataTableUrlState.ts` — URL parse/serialize.
4. `createCrudApi.ts` — only if backend serialization differs from scalar/array/range behavior.
5. `README.md` — public documentation.

Filter state uses frontend column ids until `useDataTable` maps them to backend field names.

## Field mapping

Shared form default:

```text
frontend key -> snake_case backend key
```

Examples:

```text
backgroundColor -> background_color
lastSeenAt      -> last_seen_at
```

Explicit `field` always wins:

```ts
company: {
  field: "company_id",
  ...
}
```

Keep mapping centralized in `DataForm.utils.ts`.

## Conditional fields

Conditions receive:

```ts
{
  mode,
  values,
}
```

They must remain synchronous and side-effect free.

Do not perform HTTP requests inside `hidden` or `disabled` callbacks.

## Parse / serialize

`parse` runs while backend detail data becomes form values.

`serialize` runs while form values become a mutation payload.

Use these for representation conversion, not for network calls or unrelated business side effects.

## Server errors

Server-error parsing is centralized in `parseDataFormServerErrors()`.

It understands:

```text
Axios error.response.data
field: [messages]
non_field_errors
detail
```

When introducing another backend error convention, extend this parser rather than adding special cases to field controls.

## createCrudApi and Axios

The application should do this:

```ts
const api = createCrudApi({
  axios: Axios,
  endpoints: {...},
});
```

Do not add a global Axios singleton or application Provider inside Contour UI just to hide this dependency. One datasource object can already be shared by both DataTable and DataForm, so Axios injection happens once at API construction time.

## Package build

`vite.config.ts` builds the library bundle and extracts CSS.

`tsconfig.lib.json` emits declaration files.

The order in `package.json` matters:

```text
vite build
then
tsc declaration build
```

Vite clears `dist`, so running TypeScript declarations first would delete `dist/index.d.ts`.

`src/index.ts` is the root public entry point. Add new public packages there.

The consumer imports styles once:

```ts
import "@company/ui/styles.css";
```

## Public API rule

Prefer a small root API:

```ts
import {
  Button,
  DataForm,
  DataTable,
  createCrudApi,
  defineDataForm,
  defineDataTable,
} from "@company/ui";
```

Internal orchestration components should not be exported unless an application has a real supported use case for them.
