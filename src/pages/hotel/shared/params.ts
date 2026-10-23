export const SORT_BY_VALUES = ['price', 'rating', 'distance'] as const;

export type SortBy = (typeof SORT_BY_VALUES)[number];

/** 不限星级 */
export const UNLIMITED_STAR = 0;

export const STAR_VALUES = [UNLIMITED_STAR, 3, 4, 5] as const;

export type Star = (typeof STAR_VALUES)[number];

export interface SearchParams {
  keyword: string;
  star: Star;
  sortBy: SortBy;
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  keyword: '',
  star: UNLIMITED_STAR,
  sortBy: 'price',
};

const { keyword: defaultKeyword, star: defaultStar, sortBy: defaultSortBy } = DEFAULT_SEARCH_PARAMS;

// 与地址栏查询串共享的查询键
const SEARCH_QUERY_KEYS = {
  keyword: 'keyword',
  star: 'star',
  sortBy: 'sortBy',
} as const;

const isStar = (value: number): value is Star =>
  STAR_VALUES.some((candidate) => candidate === value);

const isSortBy = (value: string): value is SortBy =>
  SORT_BY_VALUES.some((candidate) => candidate === value);

export function parseSearchParams(search: string): SearchParams | null {
  const query = new URLSearchParams(search);
  const rawKeyword = query.get(SEARCH_QUERY_KEYS.keyword);
  const rawStar = query.get(SEARCH_QUERY_KEYS.star);
  const rawSortBy = query.get(SEARCH_QUERY_KEYS.sortBy);
  const hasNoSearchQuery = rawKeyword === null && rawStar === null && rawSortBy === null;

  if (hasNoSearchQuery) {
    return null;
  }

  const star = Number(rawStar);

  return {
    keyword: rawKeyword ?? defaultKeyword,
    star: isStar(star) ? star : defaultStar,
    sortBy: rawSortBy !== null && isSortBy(rawSortBy) ? rawSortBy : defaultSortBy,
  };
}

/** storage 里的值不可信：逐字段收窄，任一不合法就回落到默认值 */
export function readPersistedSearchParams(value: unknown): SearchParams {
  if (typeof value !== 'object' || value === null) {
    return DEFAULT_SEARCH_PARAMS;
  }

  const keyword =
    'keyword' in value && typeof value.keyword === 'string' ? value.keyword : defaultKeyword;
  const star =
    'star' in value && typeof value.star === 'number' && isStar(value.star)
      ? value.star
      : defaultStar;
  const sortBy =
    'sortBy' in value && typeof value.sortBy === 'string' && isSortBy(value.sortBy)
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
    result[SEARCH_QUERY_KEYS.keyword] = trimmedKeyword;
  }
  if (star !== defaultStar) {
    result[SEARCH_QUERY_KEYS.star] = String(star);
  }
  if (sortBy !== defaultSortBy) {
    result[SEARCH_QUERY_KEYS.sortBy] = sortBy;
  }

  return result;
}

export function writeParamsToUrl(searchParams: SearchParams) {
  const query = new URLSearchParams(serializeParams(searchParams)).toString();

  history.replaceState(null, '', query === '' ? window.location.pathname : `?${query}`);
}
