import type { CrudDetail } from "../../lib/crud";
import type { DataFormDefinition } from "./DataForm.types";

export function defineDataForm<
  TItem,
  TDetail extends CrudDetail = CrudDetail,
>(
  definition: DataFormDefinition<TItem, TDetail>,
): DataFormDefinition<TItem, TDetail> {
  return definition;
}
