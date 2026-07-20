import type { ListingFilters } from "./types";

/** 从 URL query string 解析初始筛选条件，非法值回落到默认 */
export function parseFilters(search: string): ListingFilters {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const roomType = query.get("roomType") ?? "";
  return { keyword, roomType };
}
