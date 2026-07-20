import type { SortBy } from "../../shared/types";

/** 排序切换选项 */
export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "价格优先", value: "price" },
  { label: "起飞时间", value: "departTime" },
];
