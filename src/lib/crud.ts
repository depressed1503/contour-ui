export type CrudId = string | number;

export type CrudPayload = Record<string, unknown> | FormData;

export type CrudDetail = Record<string, unknown>;

export interface CrudDataSource<
  TItem,
  TDetail extends CrudDetail = CrudDetail,
> {
  getOne?(id: string, signal: AbortSignal): Promise<TDetail>;

  create?(payload: CrudPayload, signal: AbortSignal): Promise<TItem>;

  update?(
    id: string,
    payload: CrudPayload,
    signal: AbortSignal,
  ): Promise<TItem>;

  delete?(id: string, signal: AbortSignal): Promise<void>;
}
