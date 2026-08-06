export const SORT_BY_VALUES = ["price", "rating", "distance"] as const;

export type SortBy = (typeof SORT_BY_VALUES)[number];

export interface SearchParams {
  keyword: string;
  star: number;
  sortBy: SortBy;
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  keyword: "",
  star: 0,
  sortBy: "price",
};

const isSortBy = (value: string): value is SortBy =>
  (SORT_BY_VALUES as readonly string[]).includes(value);

export function parseSearchParams(search: string): SearchParams | null {
  const query = new URLSearchParams(search);
  const rawKeyword = query.get("keyword");
  const rawStar = query.get("star");
  const rawSortBy = query.get("sortBy");

  if (rawKeyword === null && rawStar === null && rawSortBy === null) {
    return null;
  }

  const {
    keyword: defaultKeyword,
    star: defaultStar,
    sortBy: defaultSortBy,
  } = DEFAULT_SEARCH_PARAMS;
  const star = Number(rawStar);

  return {
    keyword: rawKeyword ?? defaultKeyword,
    star: Number.isInteger(star) && star >= 1 && star <= 5 ? star : defaultStar,
    sortBy:
      rawSortBy !== null && isSortBy(rawSortBy) ? rawSortBy : defaultSortBy,
  };
}

function serializeParams(searchParams: SearchParams): Record<string, string> {
  const { keyword, star, sortBy } = searchParams;
  const {
    keyword: defaultKeyword,
    star: defaultStar,
    sortBy: defaultSortBy,
  } = DEFAULT_SEARCH_PARAMS;
  const trimmedKeyword = keyword.trim();
  const result: Record<string, string> = {};

  if (trimmedKeyword !== defaultKeyword) {
    result.keyword = trimmedKeyword;
  }
  if (star !== defaultStar) {
    result.star = String(star);
  }
  if (sortBy !== defaultSortBy) {
    result.sortBy = sortBy;
  }

  return result;
}

export function writeParamsToUrl(searchParams: SearchParams) {
  const query = new URLSearchParams(serializeParams(searchParams)).toString();

  history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname,
  );
}
