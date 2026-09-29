# Contour UI DataTable

`DataTable` is a declarative server-driven table for internal CRUD pages. The consumer describes columns, data access and optional editor behavior once, then renders:

```tsx
<DataTable definition={assetGroupTagsTable} />
```

The component owns pagination, sorting, filters, URL state, column visibility, row selection, bulk actions and generated Create/Edit/Delete UI. Application-specific behavior stays in the definition or in explicit extension points.

## Install

```bash
npm install
```

The table uses React, Base UI, TanStack Table and TanStack Form.

## Quick start

```tsx
import {
  DataTable,
  createCrudApi,
  defineDataTable,
} from "./components/data-table";

type AssetGroupTag = {
  id: number;
  text: string;
  description: string;
  fontColor: string;
  backgroundColor: string;
};

const assetGroupTagsApi = createCrudApi<AssetGroupTag>({
  endpoint: "/api/asset-group-tags/",
});

const assetGroupTagsTable = defineDataTable<AssetGroupTag>({
  id: "asset-group-tags",
  datasource: assetGroupTagsApi,
  getRowId: (row) => String(row.id),
  selection: true,

  columns: {
    text: {
      label: "Text",
      sortable: true,
      filter: "text",
    },
    description: {
      label: "Description",
      filter: "text",
    },
    fontColor: {
      label: "Font color",
      sortField: "font_color",
    },
    backgroundColor: {
      label: "Background color",
      sortField: "background_color",
    },
  },

  editor: {
    entityLabel: "tag",
    getRowLabel: (row) => row.text,
    create: true,
    edit: true,
    delete: true,
    fields: {
      text: {
        type: "text",
        label: "Text",
        required: true,
      },
      description: {
        type: "textarea",
        label: "Description",
      },
      fontColor: {
        type: "text",
        label: "Font color",
      },
      backgroundColor: {
        type: "text",
        label: "Background color",
      },
    },
  },
});

export function AssetGroupTagsPage() {
  return <DataTable definition={assetGroupTagsTable} />;
}
```

## DRF contract

`createCrudApi()` expects the standard collection/detail routes:

```text
GET    /api/tags/
POST   /api/tags/
GET    /api/tags/:id/
PATCH  /api/tags/:id/
DELETE /api/tags/:id/
```

List responses use the standard DRF pagination shape:

```json
{
  "count": 120,
  "next": "...",
  "previous": null,
  "results": []
}
```

Updates use `PATCH`.

The adapter sends `Accept: application/json` and sends JSON for create/update. Additional headers can be supplied through `createCrudApi({ headers })`.

## Columns

Simple column:

```tsx
columns: {
  name: "Name",
}
```

Configured column:

```tsx
columns: {
  status: {
    label: "Status",
    sortable: true,
    filter: {
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
      ],
    },
    cell: ({ value }) => <Badge>{value}</Badge>,
  },
}
```

Supported filter types:

- `text`
- `select`
- `multiselect`
- `number`
- `number-range`
- `date`
- `datetime`
- `date-range`
- `datetime-range`

For sorting, use `sortField` when the backend field differs from the frontend property:

```tsx
createdAt: {
  label: "Created",
  sortable: true,
  sortField: "created_at",
}
```

For filters, set `field` on the filter config:

```tsx
createdAt: {
  label: "Created",
  filter: {
    type: "date",
    field: "created_at",
  },
}
```

The browser URL keeps frontend column ids. Mapping to backend field names happens only before the datasource call.

## Pagination and URL state

```tsx
pagination: {
  defaultPageSize: 25,
  pageSizeOptions: [25, 50, 100],
}
```

The table stores list state in the URL:

```text
?page=2&page_size=25&ordering=-createdAt&status=active
```

Column visibility preferences are stored per table id in `localStorage`.

## Selection

Enable row selection with:

```tsx
selection: true,
getRowId: (row) => String(row.id),
```

`getRowId` is required for selection and for generated Edit/Delete row actions.

The header checkbox selects or deselects the current page. Selection is represented by stable ids.

## Bulk actions

Bulk actions are always available through the `Actions` menu. When an action is chosen, the user selects either:

- selected records;
- all records matching the current committed filters.

The action receives one of these targets:

```ts
{ ids: ["1", "2"] }
```

or:

```ts
{
  filters: [
    {
      id: "status",
      operator: "include",
      value: "active",
    },
  ],
}
```

Example:

```tsx
bulkActions: [
  {
    id: "archive",
    label: "Archive",
    onAction: async ({ target, signal }) => {
      await archiveAssets(target, signal);
    },
  },
]
```

### Bulk action with extra fields

```tsx
bulkActions: [
  {
    id: "change-status",
    label: "Change status",
    confirmLabel: "Apply",
    initialValues: {
      status: "active",
    },
    renderFields: ({ values, setValues }) => {
      const form = values as { status: string };

      return (
        <Field>
          <Field.Label>Status</Field.Label>
          <Select
            items={statusOptions}
            value={form.status}
            onValueChange={(status) => {
              if (status) {
                setValues({ ...form, status });
              }
            }}
          >
            ...
          </Select>
        </Field>
      );
    },
    onAction: async ({ target, values, signal }) => {
      await changeStatus(target, values, signal);
    },
  },
]
```

By default a successful bulk action clears selection and refreshes the table. Set `clearSelectionOnSuccess: false` or `refreshOnSuccess: false` to change that behavior.

## Generated CRUD editor

Enable generated CRUD UI with `editor`:

```tsx
editor: {
  entityLabel: "asset",
  getRowLabel: (row) => row.name,
  create: true,
  edit: true,
  delete: true,
  fields: {
    name: {
      type: "text",
      label: "Name",
      required: true,
    },
  },
}
```

The table then adds:

- a Create button to the toolbar;
- an Edit item to each row action menu;
- a Delete item with a Yes/No confirmation dialog;
- `GET /:id/` before opening an Edit form;
- POST/PATCH/DELETE mutations through the datasource;
- refresh after a successful mutation.

There is no optimistic update in the first version.

### Editor field types

Supported field types:

```text
text
textarea
number
select
multiselect
checkbox
date
datetime
```

Example:

```tsx
fields: {
  name: {
    type: "text",
    label: "Name",
    required: true,
    minLength: 2,
    maxLength: 80,
  },

  description: {
    type: "textarea",
    label: "Description",
    rows: 5,
  },

  priority: {
    type: "number",
    label: "Priority",
    min: 1,
    max: 5,
  },

  status: {
    type: "select",
    label: "Status",
    options: statusOptions,
  },

  channels: {
    type: "multiselect",
    label: "Channels",
    options: channelOptions,
  },

  featured: {
    type: "checkbox",
    label: "Featured",
  },

  publishedAt: {
    type: "date",
    label: "Published",
  },

  lastSeenAt: {
    type: "datetime",
    label: "Last seen",
  },
}
```

### Backend field names

Editor keys are frontend names. Unless `field` is provided, request/detail field names are converted to snake_case automatically:

```text
assetsCount -> assets_count
lastSeenAt  -> last_seen_at
```

Override explicitly when the backend name is not a simple snake_case conversion:

```tsx
company: {
  type: "select",
  label: "Company",
  field: "company_id",
  options: companyOptions,
}
```

For Edit, detail data is first read by the backend field name and then by the frontend key as a fallback.

### Create-only, edit-only and hidden fields

```tsx
fields: {
  password: {
    type: "text",
    label: "Password",
    createOnly: true,
  },
  immutableCode: {
    type: "text",
    label: "Code",
    editOnly: true,
  },
  internalFlag: {
    type: "checkbox",
    label: "Internal",
    hidden: true,
  },
}
```

### Validation

Built-in rules include:

- `required`
- `minLength`
- `maxLength`
- `min`
- `max`

Add custom synchronous validation with `validate`:

```tsx
priority: {
  type: "number",
  label: "Priority",
  validate: (value, { values, mode }) => {
    if (typeof value === "number" && Number.isInteger(value)) {
      return undefined;
    }

    return "Priority must be a whole number.";
  },
}
```

Return `undefined` when valid or an error string when invalid.

Server errors are currently displayed as a generic request-level error. Field-level DRF error mapping is intentionally not part of this version yet.

### Custom field rendering

Use `renderField` when one generated field needs a custom control:

```tsx
editor: {
  fields: {
    backgroundColor: {
      type: "text",
      label: "Background color",
    },
  },

  renderField: {
    backgroundColor: ({ value, setValue, error }) => (
      <ColorPicker
        value={String(value ?? "")}
        invalid={Boolean(error)}
        onChange={setValue}
      />
    ),
  },
}
```

The DataTable still owns the label, description, validation error and form lifecycle.

Use `renderAfter` for previews or additional blocks:

```tsx
renderAfter: ({ mode, values, row }) => (
  <TagPreview values={values} />
)
```

## Custom row actions

Add application-specific items to the row menu without replacing generated Edit/Delete actions:

```tsx
rowActions: [
  {
    id: "duplicate",
    label: "Duplicate",
    onAction: async (row, { refresh }) => {
      await duplicateAsset(row.id);
      refresh();
    },
  },
  {
    id: "disable",
    label: "Disable",
    variant: "danger",
    disabled: (row) => row.status === "archived",
    onAction: async (row) => {
      await disableAsset(row.id);
    },
  },
]
```

For custom row actions, the application owns any additional confirmation/modal UI it needs.

## Using a custom datasource

You do not have to use `createCrudApi`.

At minimum a datasource implements `getList`:

```tsx
const datasource: DataTableDataSource<User> = {
  async getList(query, signal) {
    return {
      items: [],
      count: 0,
    };
  },
};
```

Generated CRUD features additionally require the corresponding methods:

```ts
getOne(id, signal)
create(payload, signal)
update(id, payload, signal)
delete(id, signal)
```

This keeps the DataTable independent from DRF even though `createCrudApi` is optimized for the team's current DRF API.

## Error behavior

`createCrudApi` throws `DataTableRequestError` for non-2xx responses. It exposes:

```ts
error.status
error.body
error.message
```

If the backend returns `{ "detail": "..." }`, `detail` becomes the error message. Other backend validation shapes are retained in `error.body` but are not mapped to fields yet.

## Public API vs internal components

Consumers should import from:

```tsx
import {
  DataTable,
  createCrudApi,
  defineDataTable,
} from "./components/data-table";
```

Do not import `DataTableEngine`, editor dialogs or internal hooks directly from application code. Those are implementation details and may change while the public definition API stays stable.

For maintainers and extension recipes, see [`DEVELOPMENT.md`](./DEVELOPMENT.md).
