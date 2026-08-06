export const SORT_BY_VALUES = ["price", "rating", "distance"] as const;

export type SortBy = (typeof SORT_BY_VALUES)[number];

export interface SearchParams {
  keyword: string;
  star: number;
  sortBy: SortBy;
}

const DEFAULT_SORT: SortBy = "price";

const isSortBy = (value: string): value is SortBy =>
  (SORT_BY_VALUES as readonly string[]).includes(value);

export function parseSearchParams(search: string): SearchParams {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const rawStar = Number(query.get("star"));
  const star =
    Number.isInteger(rawStar) && rawStar >= 1 && rawStar <= 5 ? rawStar : 0;
  const rawSortBy = query.get("sortBy") ?? "";
  const sortBy = isSortBy(rawSortBy) ? rawSortBy : DEFAULT_SORT;

  return {
    keyword,
    star,
    sortBy,
  };
}

export function serializeParams(
  searchParams: SearchParams,
): Record<string, string> {
  const { keyword, star, sortBy } = searchParams;
  const result: Record<string, string> = {};
  if (keyword.trim() !== "") {
    result.keyword = keyword.trim();
  }
  if (star !== 0) {
    result.star = String(star);
  }
  if (sortBy !== DEFAULT_SORT) {
    result.sortBy = sortBy;
  }
  return result;
}
