# Руководство сопровождающего Contour UI

Этот документ предназначен для разработчиков, которые расширяют саму UI-библиотеку.

## Архитектура

Предполагаемое направление зависимостей:

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

Application-specific Axios configuration остаётся в приложении. Contour UI получает готовый client через `createCrudApi({ axios })`.

Не импортируйте в библиотеку application-level `axiosConfig.ts`, environment variables, cookies, authentication logic или business API.

## Общий CRUD datasource

`src/lib/crud.ts`

Определяет transport-neutral контракт detail/mutation, общий для DataTable и DataForm:

```text
getOne
create
update
delete
```

`src/components/data-table/DataTable.types.ts` расширяет этот контракт методом `getList`.

`src/components/data-table/createCrudApi.ts` — адаптер DRF/Axios. Он сериализует query state DataTable и делегирует HTTP-поведение Axios instance, который передаёт host application.

Так как тип Axios используется структурно, Contour UI не нужна runtime-зависимость от Axios.

## Карта файлов DataForm

`src/components/data-form/DataForm.types.ts`

Публичный контракт DataForm: modes, values, field definitions, conditions, layout, validation, parse/serialize hooks и render contexts.

`src/components/data-form/defineDataForm.ts`

Identity helper для type inference и публичного описания definition.

`src/components/data-form/DataForm.tsx`

Оркестрация формы. Отвечает за detail loading, lifecycle TanStack Form, submit state, server errors, create/update calls, view mode и layout composition.

`src/components/data-form/DataFormField.tsx`

Маппит generic field definitions на Contour UI primitives.

`src/components/data-form/DataForm.utils.ts`

Чистая логика формы: snake_case mapping, initial values, создание payload, conditions, validation и нормализация DRF/Axios server errors.

`src/components/data-form/DataForm.module.css`

Стили layout и status для генерируемых форм.

`src/components/data-form/index.ts`

Публичные экспорты DataForm.

## Карта файлов DataTable

`src/components/data-table/DataTable.types.ts`

Публичные контракты таблицы. Типы editor-полей являются alias на общую field model DataForm.

`src/components/data-table/useDataTable.ts`

List loading, URL state, filter debounce, selection, refresh и column preferences.

`src/components/data-table/DataTable.tsx`

Высокоуровневая композиция toolbar, engine, pagination, bulk actions и CRUD dialogs.

`src/components/data-table/DataTableEngine.tsx`

Интеграция TanStack Table и рендеринг таблицы.

`src/components/data-table/DataTableFilterControl.tsx`

Filter controls и include/exclude behavior.

`src/components/data-table/DataTableUrlState.ts`

URL serialization для pagination, sorting и filters.

`src/components/data-table/DataTableColumnPreferences.ts`

LocalStorage-настройки колонок.

`src/components/data-table/DataTableActionsMenu.tsx`

Всегда видимое bulk Actions menu.

`src/components/data-table/DataTableBulkActionDialog.tsx`

Выбор между selected IDs и всеми отфильтрованными записями плюс optional action-specific fields.

`src/components/data-table/DataTableEditorDialog.tsx`

Сгенерированный Create/Edit dialog DataTable. Использует общие DataForm field definitions и общий renderer полей.

`src/components/data-table/DataTableEditorField.tsx`

Compatibility wrapper вокруг общего `DataFormField` renderer. Сохраняет поддержку старого extension point `editor.renderField`.

`src/components/data-table/DataTableEditor.utils.ts`

Compatibility wrappers вокруг общих DataForm utility functions.

`src/components/data-table/DataTableDeleteDialog.tsx`

Сгенерированный delete confirmation.

`src/components/data-table/DataTableRowActions.tsx`

Сгенерированные Edit/Delete actions плюс custom row actions.

## Добавление нового типа поля формы/editor

Типы полей теперь общие для standalone DataForm и DataTable editors. Не реализуйте один и тот же тип отдельно в таблице.

Пример: добавляем `color`.

### 1. Расширить публичный union полей

Измените `src/components/data-form/DataForm.types.ts`.

Добавьте discriminator в `DataFormFieldBase["type"]` и создайте отдельный interface:

```ts
export interface DataFormColorField extends DataFormFieldBase {
  type: "color";
}
```

Добавьте его в `DataFormFieldDefinition` и экспортируйте из `src/components/data-form/index.ts`.

Если consumer'ам нужно legacy DataTable-specific имя типа, добавьте alias в `DataTable.types.ts` и экспортируйте его из `data-table/index.ts`.

### 2. Определить normalization/default behavior

Редактируйте `src/components/data-form/DataForm.utils.ts` только если новому типу нужна специальная обработка.

Типичные точки:

```text
getDataFormDefaultValue
normalizeDataFormValue
validateDataFormField
```

Не размещайте React-код в этом файле.

### 3. Отрендерить поле

Измените `src/components/data-form/DataFormField.tsx` и добавьте `case` в `renderDefaultControl()`.

Если control полезен и вне generated forms, сначала создайте reusable primitive:

```text
src/components/ui/<component>/
```

После этого используйте primitive в DataForm.

### 4. Проверить все три режима

Проверьте:

```text
create: form -> payload
edit: detail -> form -> payload
view: detail -> disabled/read-only presentation
```

Также проверьте conditional `hidden` / `disabled`, если они применимы к новому типу.

### 5. Добавить пример в playground

Обновите `src/App.tsx`, чтобы новый тип было легко проверить вручную.

### 6. Обновить README

Опишите публичный field API и добавьте хотя бы один consumer example.

## Добавление нового типа фильтра

Основные точки изменений:

1. `DataTable.types.ts` — discriminator/config type.
2. `DataTableFilterControl.tsx` — rendering control.
3. `DataTableUrlState.ts` — URL parse/serialize.
4. `createCrudApi.ts` — только если backend serialization отличается от scalar/array/range.
5. `README.md` — публичная документация.

Filter state использует frontend column ids, пока `useDataTable` не преобразует их в backend field names.

## Маппинг полей

Общее поведение формы по умолчанию:

```text
frontend key -> snake_case backend key
```

Примеры:

```text
backgroundColor -> background_color
lastSeenAt      -> last_seen_at
```

Явный `field` всегда имеет приоритет:

```ts
company: {
  field: "company_id",
  ...
}
```

Храните mapping централизованно в `DataForm.utils.ts`.

## Условные поля

Conditions получают:

```ts
{
  mode,
  values,
}
```

Они должны оставаться синхронными и не иметь side effects.

Не выполняйте HTTP requests внутри callbacks `hidden` или `disabled`.

## Parse / serialize

`parse` выполняется, когда backend detail data преобразуется в form values.

`serialize` выполняется, когда form values преобразуются в mutation payload.

Используйте их для преобразования представления данных, а не для network calls или посторонних business side effects.

## Ошибки сервера

Парсинг server errors централизован в `parseDataFormServerErrors()`.

Он понимает:

```text
Axios error.response.data
field: [messages]
non_field_errors
detail
```

Если появляется новый backend error convention, расширяйте этот parser вместо добавления special cases в field controls.

## createCrudApi и Axios

Приложение должно делать так:

```ts
const api = createCrudApi({
  axios: Axios,
  endpoints: {...},
});
```

Не добавляйте global Axios singleton или application Provider внутрь Contour UI только для того, чтобы скрыть эту dependency.

Один datasource object уже можно переиспользовать и в DataTable, и в DataForm, поэтому Axios injection выполняется один раз при создании API.

## Сборка пакета

`vite.config.ts` собирает library bundle и извлекает CSS.

`tsconfig.lib.json` генерирует declaration files.

Порядок в `package.json` важен:

```text
vite build
затем
tsc declaration build
```

Vite очищает `dist`, поэтому если сначала генерировать TypeScript declarations, `dist/index.d.ts` будет удалён.

`src/index.ts` — корневая публичная точка входа. Добавляйте новые публичные packages туда.

Consumer импортирует стили один раз:

```ts
import "@company/ui/styles.css";
```

## Правило публичного API

Предпочитайте небольшой root API:

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

Внутренние orchestration components не должны экспортироваться, пока у приложения нет реального поддерживаемого use case для них.
