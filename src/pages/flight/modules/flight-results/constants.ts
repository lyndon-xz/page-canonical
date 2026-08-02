import type { SortBy } from "../../shared/types";

export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "价格优先", value: "price" },
  { label: "起飞时间", value: "departTime" },
];
