import type { SearchParams } from "./types";

/** 从 URL query string 解析初始搜索条件，非法值回落到默认 */
export function parseSearchParams(search: string): SearchParams {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const rawStar = Number(query.get("star"));
  const star =
    Number.isInteger(rawStar) && rawStar >= 1 && rawStar <= 5 ? rawStar : 0;
  return { keyword, star };
}

/** 将搜索条件序列化为 URL query 参数（仅保留有意义的字段） */
export function serializeParams(
  searchParams: SearchParams,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (searchParams.keyword.trim() !== "") {
    result.keyword = searchParams.keyword.trim();
  }
  if (searchParams.star !== 0) {
    result.star = String(searchParams.star);
  }
  return result;
}
