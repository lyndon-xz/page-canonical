export interface Hotel {
  id: string;
  name: string;
  city: string;
  pricePerNight: number;
  rating: number;
  /** 星级：1~5 */
  star: number;
  /** 距市中心 */
  distanceKm: number;
}

export type SortBy = "price" | "rating" | "distance";

export interface SearchParams {
  keyword: string;
  /** 星级筛选，0 表示不限 */
  star: number;
  /** 取数参数：分页加载下排序须由服务端在全量数据上做 */
  sortBy: SortBy;
}

/** hasMore 由服务端给出，不靠 items.length < pageSize 推断——末页满页时会多请求一次空页 */
export interface HotelPage {
  items: Hotel[];
  hasMore: boolean;
  /** 匹配筛选条件的总条数，与本页取回多少条无关 */
  total: number;
}

/** 批量收藏里单项的失败原因 */
export interface BatchFavoriteFailure {
  hotelId: string;
  reason: string;
}

export interface BatchFavoriteResult {
  succeededIds: string[];
  failures: BatchFavoriteFailure[];
}
