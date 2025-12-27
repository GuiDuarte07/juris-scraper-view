import type React from "react";
export type ColumnType = "string" | "number" | "boolean" | "date" | "currency";

export type StringFilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith";
export type NumberFilterOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "greaterOrEqual"
  | "lessOrEqual";
export type BooleanFilterOperator = "all" | "true" | "false";

export type FilterOperator =
  | StringFilterOperator
  | NumberFilterOperator
  | BooleanFilterOperator;

export interface ColumnFilter {
  operator: FilterOperator;
  value: string | number | boolean;
}

export interface ColumnSort {
  direction: "asc" | "desc" | null;
}

export interface ColumnConfig<T = any> {
  field: keyof T;
  header: string;
  type: ColumnType;
  width?: string;
  editable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataGridFilters {
  [field: string]: ColumnFilter | undefined;
}

export interface DataGridSort {
  field: string;
  direction: "asc" | "desc";
}

export interface DataGridState {
  filters: DataGridFilters;
  sort: DataGridSort | null;
  page: number;
  pageSize: number;
}

// Backend query format
export interface DataGridQuery {
  filters: Array<{
    field: string;
    operator: FilterOperator;
    value: string | number | boolean;
  }>;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  page: number;
  pageSize: number;
}
