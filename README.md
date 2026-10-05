# Contour UI

Internal React UI kit with declarative `DataTable` and `DataForm` for CRUD-heavy applications.

The main goal is to let application developers describe backend fields and UI behavior in configuration instead of rebuilding forms, filters, pagination and dialogs for every endpoint.

## Install from local package

Build and pack the library:

```bash
npm install
npm run pack:local
```

Install the generated package in another application:

```bash
npm install ./company-ui-0.1.0.tgz
```

Import the library styles once in the host application, usually in `main.tsx`:

```ts
import "@company/ui/styles.css";
```

## Public UI components

The root package exports the existing Contour UI primitives:

```tsx
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Field,
  Input,
  Menu,
  Popover,
  RadioGroup,
  Select,
  Switch,
  Table,
  Textarea,
  Tooltip,
} from "@company/ui";
```

## Axios and CRUD data access

Contour UI does not import your application-specific Axios config. Pass the Axios instance created by the host application into `createCrudApi`.

This means your existing `baseURL`, CSRF settings, cookies and interceptors remain application-owned.

```ts
import Axios from "@/api/axiosConfig";
import { createCrudApi } from "@company/ui";

type Asset = {
  id: number;
  name: string;
  status: string;
};

export const assetApi = createCrudApi<Asset>({
  axios: Axios,
  endpoints: {
    list: "assets/",
    detail: (id) => `assets/${id}/`,
  },
});
```

With an Axios `baseURL` such as:

```text
https://host/sm_portal_api/
```

use relative endpoint paths without a leading slash:

```text
assets/
assets/42/
```

`createCrudApi` supports:

```text
GET    list
GET    detail
POST   create
PATCH  update
DELETE delete
```

Custom routes can be supplied:

```ts
createCrudApi<Asset>({
  axios: Axios,
  endpoints: {
    list: "assets/",
    detail: (id) => `assets/${id}/`,
    create: "assets/create/",
    update: (id) => `assets/${id}/edit/`,
    delete: (id) => `assets/${id}/remove/`,
  },
});
```

The same datasource can be reused by both `DataTable` and `DataForm`. This is the preferred pattern: Axios is injected once into the datasource factory, not passed through every UI component.

## DataForm

`DataForm` is a generated form driven by a field definition.

Supported modes:

```text
create
edit
view
```

For `edit` and `view`, the form loads detail data with `datasource.getOne(id)`.

### Basic definition

```tsx
import {
  DataForm,
  defineDataForm,
} from "@company/ui";

const assetForm = defineDataForm<Asset>({
  id: "asset-form",
  datasource: assetApi,

  fields: {
    name: {
      type: "text",
      label: "Name",
      required: true,
    },

    status: {
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" },
      ],
    },
  },
});
```

Create:

```tsx
<DataForm
  definition={assetForm}
  mode="create"
/>
```

Edit:

```tsx
<DataForm
  definition={assetForm}
  mode="edit"
  id={42}
/>
```

View:

```tsx
<DataForm
  definition={assetForm}
  mode="view"
  id={42}
/>
```

## DataForm field types

Built-in field types:

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

```ts
fields: {
  title: {
    type: "text",
    label: "Title",
    required: true,
    minLength: 2,
    maxLength: 100,
  },

  description: {
    type: "textarea",
    label: "Description",
    rows: 5,
  },

  amount: {
    type: "number",
    label: "Amount",
    min: 0,
    step: 1,
  },

  companyId: {
    type: "select",
    label: "Company",
    field: "company_id",
    options: companyItems,
  },

  channels: {
    type: "multiselect",
    label: "Channels",
    options: channelItems,
  },

  enabled: {
    type: "checkbox",
    label: "Enabled",
  },

  startDate: {
    type: "date",
    label: "Start date",
  },

  runAt: {
    type: "datetime",
    label: "Run at",
  },
}
```

### Backend field mapping

The frontend definition key is converted to snake_case by default:

```text
backgroundColor -> background_color
lastSeenAt      -> last_seen_at
```

Use `field` when the backend name is different:

```ts
company: {
  type: "select",
  label: "Company",
  field: "company_id",
  options: companyItems,
}
```

### Conditional fields

`hidden` and `disabled` may be booleans or functions of current form values:

```ts
description: {
  type: "textarea",
  label: "Description",
  hidden: ({ values }) => values.featured !== true,
},

channels: {
  type: "multiselect",
  label: "Channels",
  options: channelItems,
  disabled: ({ values }) => values.status === "archived",
},
```

### Layout

```ts
const definition = defineDataForm({
  id: "example",
  datasource,
  layout: {
    columns: 2,
  },
  fields: {
    name: {
      type: "text",
      label: "Name",
      span: 2,
    },
    status: {
      type: "select",
      label: "Status",
      options: statusItems,
    },
  },
});
```

On narrow screens the grid collapses to one column automatically.

### Validation

Built-in validation includes `required`, string length and numeric `min/max`.

Use `validate` for business-specific synchronous validation:

```ts
priority: {
  type: "number",
  label: "Priority",
  required: true,
  min: 1,
  max: 5,
  validate: (value) =>
    typeof value === "number" && Number.isInteger(value)
      ? undefined
      : "Priority must be a whole number.",
}
```

### Parse and serialize

Use `parse` to transform detail data into form state and `serialize` to transform form state into the backend payload.

```ts
price: {
  type: "number",
  label: "Price",

  parse: (backendValue) =>
    Number(backendValue) / 100,

  serialize: (formValue) =>
    Number(formValue) * 100,
}
```

### Custom field renderer

A field can replace its default control:

```tsx
priority: {
  type: "number",
  label: "Priority",
  min: 1,
  max: 5,

  render: ({ value, disabled, setValue }) => (
    <Input
      type="range"
      min={1}
      max={5}
      value={Number(value ?? 3)}
      disabled={disabled}
      onChange={(event) =>
        setValue(Number(event.target.value))
      }
    />
  ),
}
```

Use `renderAfter` for previews or additional blocks that depend on the whole form:

```tsx
renderAfter: ({ values }) => (
  <Preview values={values} />
)
```

### Server errors

`DataForm` understands DRF-style error bodies such as:

```json
{
  "name": ["This field is required."],
  "company_id": ["Invalid company."],
  "non_field_errors": ["Invalid combination."],
  "detail": "Request failed."
}
```

Errors for known backend fields are shown next to the corresponding form field. `detail`, `non_field_errors`, and unknown keys are shown as form-level errors.

The parser also recognizes Axios errors through `error.response.data`.

## DataTable

The existing table API remains definition-driven:

```tsx
const assetTable = defineDataTable<Asset>({
  id: "assets",
  datasource: assetApi,
  getRowId: (row) => String(row.id),
  selection: true,

  columns: {
    name: {
      label: "Name",
      sortable: true,
      filter: "text",
    },
  },
});

<DataTable definition={assetTable} />
```

The table supports server pagination, sorting, filters, URL state, column visibility, selection, bulk actions, row actions and generated CRUD dialogs.

### Shared form fields with DataTable editor

`DataTable.editor.fields` and standalone `DataForm.fields` now use the same field definition model.

That means a new generic field type should be implemented once in the DataForm field layer and then becomes available to generated DataTable editors as well.

Legacy `editor.renderField` remains available for compatibility, but new definitions should prefer field-level `render`.

## Playground

Run the local playground:

```bash
npm run dev
```

`src/App.tsx` contains examples of the existing Contour UI primitives, `DataForm` in Create/Edit/View modes, conditional fields, validation, custom rendering, and the existing `DataTable` demo.

## Building the npm package

The library entry point is `src/index.ts`.

Build:

```bash
npm run build:lib
```

Pack:

```bash
npm run pack:local
```

The build intentionally runs Vite before declaration generation so Vite cannot erase the generated `.d.ts` files:

```text
vite build -> tsc declarations
```

Expected output includes:

```text
dist/index.js
dist/index.d.ts
dist/styles.css
```
