import {
  columnVisibilityFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

export const dataTableFeatures =
  tableFeatures({
    rowSortingFeature,
    columnVisibilityFeature,
  });