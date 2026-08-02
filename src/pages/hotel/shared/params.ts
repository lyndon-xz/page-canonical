import type { SearchParams, SortBy } from "./types";

const SORT_VALUES: SortBy[] = ["price", "rating", "distance"];

const DEFAULT_SORT: SortBy = "price";

const isSortBy = (value: string): value is SortBy =>
  (SORT_VALUES as string[]).includes(value);

export function parseSearchParams(search: string): SearchParams {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const rawStar = Number(query.get("star"));
  const star =
    Number.isInteger(rawStar) && rawStar >= 1 && rawStar <= 5 ? rawStar : 0;
  const rawSortBy = query.get("sortBy") ?? "";
  const sortBy = isSortBy(rawSortBy) ? rawSortBy : DEFAULT_SORT;

  return { keyword, star, sortBy };
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
  if (searchParams.sortBy !== DEFAULT_SORT) {
    result.sortBy = searchParams.sortBy;
  }
  return result;
}
