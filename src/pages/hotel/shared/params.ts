import type { SearchParams } from "./types";

export function parseSearchParams(search: string): SearchParams {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const rawStar = Number(query.get("star"));
  const star =
    Number.isInteger(rawStar) && rawStar >= 1 && rawStar <= 5 ? rawStar : 0;
  return { keyword, star };
}

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
