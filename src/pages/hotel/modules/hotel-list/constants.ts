import type { SortBy } from "../../shared/types";

/** 排序切换选项 */
export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "价格优先", value: "price" },
  { label: "评分优先", value: "rating" },
  { label: "距离优先", value: "distance" },
];
