import type {
  DataTableDataSource,
  DataTableDetail,
  DataTableFilter,
  DataTableQuery,
  DataTableRangeValue,
} from "./DataTable.types";

export interface CrudApiOptions {
  endpoint: string;
  fetcher?: typeof fetch;
  headers?: HeadersInit;
}

interface DrfListResponse<TData> {
  count: number;
  next: string | null;
  previous: string | null;
  results: TData[];
}

export class DataTableRequestError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "DataTableRequestError";
    this.status = status;
    this.body = body;
  }
}

export function createCrudApi<TData>({
  endpoint,
  fetcher = fetch,
  headers,
}: CrudApiOptions): DataTableDataSource<TData> {
  return {
    async getList(query, signal) {
      const response = await fetcher(createListUrl(endpoint, query), {
        method: "GET",
        signal,
        headers: createHeaders(headers),
      });

      const data = await readJsonResponse<DrfListResponse<TData>>(response);

      return {
        items: data.results,
        count: data.count,
      };
    },

    async getOne(id, signal) {
      const response = await fetcher(createDetailUrl(endpoint, id), {
        method: "GET",
        signal,
        headers: createHeaders(headers),
      });

      return readJsonResponse<DataTableDetail>(response);
    },

    async create(payload, signal) {
      const response = await fetcher(normalizeCollectionEndpoint(endpoint), {
        method: "POST",
        signal,
        headers: createHeaders(headers, true),
        body: JSON.stringify(payload),
      });

      return readJsonResponse<TData>(response);
    },

    async update(id, payload, signal) {
      const response = await fetcher(createDetailUrl(endpoint, id), {
        method: "PATCH",
        signal,
        headers: createHeaders(headers, true),
        body: JSON.stringify(payload),
      });

      return readJsonResponse<TData>(response);
    },

    async delete(id, signal) {
      const response = await fetcher(createDetailUrl(endpoint, id), {
        method: "DELETE",
        signal,
        headers: createHeaders(headers),
      });

      if (!response.ok) {
        throw await createRequestError(response);
      }
    },
  };
}

function createHeaders(
  headers: HeadersInit | undefined,
  json = false,
): Headers {
  const result = new Headers(headers);

  if (!result.has("Accept")) {
    result.set("Accept", "application/json");
  }

  if (json && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json");
  }

  return result;
}

async function readJsonResponse<TData>(response: Response): Promise<TData> {
  if (!response.ok) {
    throw await createRequestError(response);
  }

  if (response.status === 204) {
    return undefined as TData;
  }

  return (await response.json()) as TData;
}

async function createRequestError(response: Response): Promise<DataTableRequestError> {
  const body = await readResponseBody(response);
  const message = getErrorMessage(body, response.status);

  return new DataTableRequestError(message, response.status, body);
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown, status: number): string {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return body.detail;
  }

  if (typeof body === "string" && body.trim()) {
    return body;
  }

  return `Request failed with status ${status}`;
}

function createDetailUrl(endpoint: string, id: string): string {
  const collection = normalizeCollectionEndpoint(endpoint);
  return `${collection}${encodeURIComponent(id)}/`;
}

function normalizeCollectionEndpoint(endpoint: string): string {
  return endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
}

function createListUrl(endpoint: string, query: DataTableQuery): string {
  const params = new URLSearchParams();

  params.set("page", String(query.page));
  params.set("page_size", String(query.pageSize));

  const ordering = serializeSorting(query.sorting);

  if (ordering) {
    params.set("ordering", ordering);
  }

  serializeFilters(params, query.filters);

  const queryString = params.toString();

  if (!queryString) {
    return endpoint;
  }

  const separator = endpoint.includes("?")
    ? endpoint.endsWith("?") || endpoint.endsWith("&")
      ? ""
      : "&"
    : "?";

  return `${endpoint}${separator}${queryString}`;
}

function serializeSorting(sorting: DataTableQuery["sorting"]): string {
  return sorting.map(({ id, desc }) => (desc ? `-${id}` : id)).join(",");
}

function serializeFilters(
  params: URLSearchParams,
  filters: DataTableFilter[],
): void {
  for (const filter of filters) {
    const key = filter.operator === "exclude" ? `${filter.id}_not` : filter.id;
    const value = serializeFilterValue(filter.value);

    if (value === null) {
      continue;
    }

    params.set(key, value);
  }
}

function serializeFilterValue(value: DataTableFilter["value"]): string | null {
  if (typeof value === "string") {
    return value || null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? null : value.map(String).join(",");
  }

  if (isRangeValue(value)) {
    return serializeRange(value);
  }

  return null;
}

function serializeRange(
  value: DataTableRangeValue<string | number>,
): string | null {
  const from = value.from === null ? "" : String(value.from);
  const to = value.to === null ? "" : String(value.to);

  if (!from && !to) {
    return null;
  }

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
