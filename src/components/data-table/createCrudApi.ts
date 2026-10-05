import type {
  DataTableDataSource,
  DataTableDetail,
  DataTableFilter,
  DataTableQuery,
  DataTableRangeValue,
} from "./DataTable.types";

export type CrudId = string | number;

/**
 * Structural subset of an Axios instance used by createCrudApi.
 * A normal `axios.create(...)` instance is compatible with this interface,
 * while @company/ui does not need to depend on axios at runtime.
 */
export interface CrudAxiosLike {
  get: (...args: any[]) => Promise<{ data: unknown }>;
  post: (...args: any[]) => Promise<{ data: unknown }>;
  patch: (...args: any[]) => Promise<{ data: unknown }>;
  delete: (...args: any[]) => Promise<unknown>;
}

export type CrudAxiosConfig = Record<string, any>;

export interface CrudEndpoints {
  list: string;
  detail: (id: CrudId) => string;
  create?: string;
  update?: (id: CrudId) => string;
  delete?: (id: CrudId) => string;
}

export interface CreateCrudApiOptions {
  /** Axios instance created by the host application. */
  axios: CrudAxiosLike;
  endpoints: CrudEndpoints;
  /** Extra Axios config merged into every request. */
  axiosConfig?: CrudAxiosConfig;
}

interface DrfPaginatedResponse<TItem> {
  count: number;
  next: string | null;
  previous: string | null;
  results: TItem[];
}

export function createCrudApi<
  TItem extends DataTableDetail,
  TDetail extends DataTableDetail = TItem,
>({
  axios,
  endpoints,
  axiosConfig,
}: CreateCrudApiOptions): DataTableDataSource<TItem, TDetail> {
  const listUrl = endpoints.list;

  const getDetailUrl = (id: CrudId): string => endpoints.detail(id);
  const getUpdateUrl = (id: CrudId): string =>
    endpoints.update ? endpoints.update(id) : getDetailUrl(id);
  const getDeleteUrl = (id: CrudId): string =>
    endpoints.delete ? endpoints.delete(id) : getDetailUrl(id);

  return {
    async getList(query, signal) {
      const response = await axios.get(listUrl, {
        ...axiosConfig,
        params: dataTableQueryToUrlParams(query),
        signal,
      });
      const data = response.data as DrfPaginatedResponse<TItem>;

      return {
        items: data.results,
        count: data.count,
      };
    },

    async getOne(id, signal) {
      const response = await axios.get(getDetailUrl(id), {
        ...axiosConfig,
        signal,
      });

      return response.data as TDetail;
    },

    async create(data, signal) {
      const response = await axios.post(
        endpoints.create ?? listUrl,
        data,
        createMutationConfig(axiosConfig, signal, data),
      );

      return response.data as TItem;
    },

    async update(id, data, signal) {
      const response = await axios.patch(
        getUpdateUrl(id),
        data,
        createMutationConfig(axiosConfig, signal, data),
      );

      return response.data as TItem;
    },

    async delete(id, signal) {
      await axios.delete(getDeleteUrl(id), {
        ...axiosConfig,
        signal,
      });
    },
  };
}

function createMutationConfig(
  config: CrudAxiosConfig | undefined,
  signal: AbortSignal,
  data: unknown,
): CrudAxiosConfig {
  if (!(data instanceof FormData)) {
    return {
      ...config,
      signal,
    };
  }

  return {
    ...config,
    signal,
    headers: {
      ...(config?.headers ?? {}),
      "Content-Type": undefined,
    },
  };
}

function dataTableQueryToUrlParams(query: DataTableQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("page_size", String(query.pageSize));
  serializeSorting(params, query.sorting);
  serializeFilters(params, query.filters);
  return params;
}

function serializeSorting(
  params: URLSearchParams,
  sorting: DataTableQuery["sorting"],
): void {
  if (sorting.length === 0) return;

  const ordering = sorting
    .map(({ id, desc }) => (desc ? `-${id}` : id))
    .join(",");

  if (ordering) params.set("ordering", ordering);
}

function serializeFilters(
  params: URLSearchParams,
  filters: DataTableFilter[],
): void {
  for (const filter of filters) {
    const key = filter.operator === "exclude" ? `${filter.id}_not` : filter.id;
    const value = serializeFilterValue(filter.value);
    if (value !== null) params.set(key, value);
  }
}

function serializeFilterValue(value: DataTableFilter["value"]): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value === "" ? null : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length === 0 ? null : value.map(String).join(",");
  if (isRangeValue(value)) return serializeRange(value);
  return null;
}

function serializeRange(
  value: DataTableRangeValue<string | number>,
): string | null {
  const from = value.from === null ? "" : String(value.from);
  const to = value.to === null ? "" : String(value.to);
  if (!from && !to) return null;
  return `${from}X${to}`;
}

function isRangeValue(
  value: DataTableFilter["value"],
): value is DataTableRangeValue<string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "from" in value &&
    "to" in value
  );
}
