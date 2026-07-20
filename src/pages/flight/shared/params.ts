import type { FlightFilters } from "./types";

/** 合法舱位取值；解析 URL 时用于校验，非法值回落到不限 */
const VALID_CABINS = ["经济舱", "商务舱", "头等舱"];

/** 从 URL query string 解析初始筛选条件，非法值回落到默认（不限） */
export function parseFilters(search: string): FlightFilters {
  const query = new URLSearchParams(search);
  const cabin = query.get("cabin") ?? "";
  return { cabin: VALID_CABINS.includes(cabin) ? cabin : "" };
}

/** 将筛选条件序列化为 URL query 参数（仅保留有意义的字段） */
export function serializeFilters(
  filters: FlightFilters,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (filters.cabin !== "") {
    result.cabin = filters.cabin;
  }
  return result;
}
