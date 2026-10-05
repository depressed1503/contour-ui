# Contour UI

Внутренняя React UI-библиотека с декларативными `DataTable` и `DataForm` для приложений с большим количеством CRUD-сценариев.

Главная цель — позволить разработчикам приложения описывать backend-поля и поведение UI конфигурацией, вместо того чтобы заново собирать формы, фильтры, пагинацию и диалоги для каждого endpoint.

## Установка из локального пакета

Собрать и упаковать библиотеку:

```bash
npm install
npm run pack:local
```

Установить сгенерированный пакет в другое приложение:

```bash
npm install ./company-ui-0.1.0.tgz
```

Один раз импортировать стили библиотеки в host-приложении, обычно в `main.tsx`:

```ts
import "@company/ui/styles.css";
```

## Публичные UI-компоненты

Корневой пакет экспортирует существующие Contour UI primitives:

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

## Axios и CRUD-доступ к данным

Contour UI не импортирует application-specific Axios config. Передайте Axios instance, созданный host-приложением, в `createCrudApi`.

Это позволяет оставить `baseURL`, CSRF-настройки, cookies и interceptors на стороне приложения.

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

Если у Axios задан `baseURL`, например:

```text
https://host/sm_portal_api/
```

используйте относительные endpoint-пути без начального `/`:

```text
assets/
assets/42/
```

`createCrudApi` поддерживает:

```text
GET    list
GET    detail
POST   create
PATCH  update
DELETE delete
```

Можно передавать нестандартные routes:

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

Один и тот же datasource можно переиспользовать и в `DataTable`, и в `DataForm`. Это предпочтительный вариант: Axios инжектится один раз при создании datasource, а не передаётся в каждый UI-компонент.

## DataForm

`DataForm` — генерируемая форма на основе декларативного описания полей.

Поддерживаемые режимы:

```text
create
edit
view
```

Для `edit` и `view` форма загружает detail-данные через `datasource.getOne(id)`.

### Базовое описание

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
<DataForm definition={assetForm} mode="create" />
```

Edit:

```tsx
<DataForm definition={assetForm} mode="edit" id={42} />
```

View:

```tsx
<DataForm definition={assetForm} mode="view" id={42} />
```

## Типы полей DataForm

Встроенные типы:

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

Пример:

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

### Маппинг backend-полей

Ключ frontend-definition по умолчанию преобразуется в `snake_case`:

```text
backgroundColor -> background_color
lastSeenAt      -> last_seen_at
```

Если имя backend-поля отличается, используйте `field`:

```ts
company: {
  type: "select",
  label: "Company",
  field: "company_id",
  options: companyItems,
}
```

### Условные поля

`hidden` и `disabled` могут быть boolean или функциями от текущих значений формы:

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

На узких экранах grid автоматически схлопывается в одну колонку.

### Валидация

Встроенная валидация включает `required`, длину строк и числовые `min/max`.

Для бизнес-валидации используйте синхронный `validate`:

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

### Parse и serialize

`parse` преобразует detail-данные backend в form state.

`serialize` преобразует form state в mutation payload.

```ts
price: {
  type: "number",
  label: "Price",
  parse: (backendValue) => Number(backendValue) / 100,
  serialize: (formValue) => Number(formValue) * 100,
}
```

### Кастомный renderer поля

Поле может заменить стандартный control:

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
      onChange={(event) => setValue(Number(event.target.value))}
    />
  ),
}
```

Для preview или дополнительных блоков, зависящих от всей формы, используйте `renderAfter`:

```tsx
renderAfter: ({ values }) => (
  <Preview values={values} />
)
```

### Ошибки сервера

`DataForm` понимает DRF-style error body:

```json
{
  "name": ["This field is required."],
  "company_id": ["Invalid company."],
  "non_field_errors": ["Invalid combination."],
  "detail": "Request failed."
}
```

Ошибки известных backend-полей отображаются рядом с соответствующим полем формы.

`detail`, `non_field_errors` и неизвестные ключи отображаются как ошибки уровня формы.

Парсер также распознаёт Axios errors через `error.response.data`.

## DataTable

Существующий API таблицы остаётся definition-driven:

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

Таблица поддерживает server pagination, sorting, filters, URL state, column visibility, selection, bulk actions, row actions и генерируемые CRUD-dialogs.

### Общие поля формы и DataTable editor

`DataTable.editor.fields` и standalone `DataForm.fields` используют одну и ту же модель field definition.

Это означает, что новый общий тип поля нужно реализовать один раз в DataForm field layer, после чего он становится доступен и в сгенерированных DataTable editors.

Legacy `editor.renderField` остаётся для обратной совместимости, но в новых definition лучше использовать field-level `render`.

## Playground

Запустить локальный playground:

```bash
npm run dev
```

`src/App.tsx` содержит примеры существующих Contour UI primitives, `DataForm` в режимах Create/Edit/View, conditional fields, validation, custom rendering и demo `DataTable`.

## Сборка npm-пакета

Точка входа библиотеки — `src/index.ts`.

Сборка:

```bash
npm run build:lib
```

Pack:

```bash
npm run pack:local
```

Сборка намеренно запускает Vite до генерации declaration-файлов, чтобы Vite не удалил сгенерированные `.d.ts`:

```text
vite build -> tsc declarations
```

Ожидаемый результат:

```text
dist/index.js
dist/index.d.ts
dist/styles.css
```
