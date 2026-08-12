export const SORT_BY_VALUES = ["price", "rating", "distance"] as const;

export type SortBy = (typeof SORT_BY_VALUES)[number];

/** 0 表示不限星级 */
export const STAR_VALUES = [0, 3, 4, 5] as const;

export type Star = (typeof STAR_VALUES)[number];

export interface SearchParams {
  keyword: string;
  star: Star;
  sortBy: SortBy;
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  keyword: "",
  star: 0,
  sortBy: "price",
};

const {
  keyword: defaultKeyword,
  star: defaultStar,
  sortBy: defaultSortBy,
} = DEFAULT_SEARCH_PARAMS;

const isStar = (value: number): value is Star =>
  STAR_VALUES.some((candidate) => candidate === value);

const isSortBy = (value: string): value is SortBy =>
  SORT_BY_VALUES.some((candidate) => candidate === value);

export function parseSearchParams(search: string): SearchParams | null {
  const query = new URLSearchParams(search);
  const rawKeyword = query.get("keyword");
  const rawStar = query.get("star");
  const rawSortBy = query.get("sortBy");

  if (rawKeyword === null && rawStar === null && rawSortBy === null) {
    return null;
  }

  const star = Number(rawStar);

  return {
    keyword: rawKeyword ?? defaultKeyword,
    star: isStar(star) ? star : defaultStar,
    sortBy:
      rawSortBy !== null && isSortBy(rawSortBy) ? rawSortBy : defaultSortBy,
  };
}

/** storage 里的值不可信：逐字段收窄，任一不合法就回落到默认值 */
export function readPersistedSearchParams(value: unknown): SearchParams {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_SEARCH_PARAMS;
  }

  const keyword =
    "keyword" in value && typeof value.keyword === "string"
      ? value.keyword
      : defaultKeyword;
  const star =
    "star" in value && typeof value.star === "number" && isStar(value.star)
      ? value.star
      : defaultStar;
  const sortBy =
    "sortBy" in value &&
    typeof value.sortBy === "string" &&
    isSortBy(value.sortBy)
      ? value.sortBy
      : defaultSortBy;

  return {
    keyword,
    star,
    sortBy,
  };
}

function serializeParams(searchParams: SearchParams): Record<string, string> {
  const { keyword, star, sortBy } = searchParams;
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
    query === "" ? window.location.pathname : `?${query}`,
  );
}
