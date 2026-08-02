export interface Hotel {
  id: string;
  name: string;
  city: string;
  pricePerNight: number;
  rating: number;
  /** 星级：1~5 */
  star: number;
  /** 距市中心距离（公里） */
  distanceKm: number;
}

export type SortBy = "price" | "rating" | "distance";

export interface SearchParams {
  keyword: string;
  /** 星级筛选，0 表示不限 */
  star: number;
  /**
   * 排序方式。
   *
   * 它是取数参数而非纯展示态：列表分页加载，排序必须由服务端在全量数据上做。
   * 放前端排已加载的部分，会让新到的一页插进已展示的卡片之间、整列重排。
   */
  sortBy: SortBy;
}

/**
 * 分页响应。hasMore 由服务端明确给出，不靠「items.length < pageSize」推断——
 * 末页刚好满页时那种推断会多请求一次空页，还会让「加载更多」多闪一下。
 */
export interface HotelPage {
  items: Hotel[];
  hasMore: boolean;
  /** 匹配筛选条件的总条数，与本页取回多少条无关 */
  total: number;
}

/** 批量收藏里单项的失败原因；只存 id，展示用的酒店名在 model 里按 id 取 */
export interface BatchFavoriteFailure {
  hotelId: string;
  reason: string;
}

/**
 * 批量收藏的结果。
 *
 * 逐项给出成败而不是整体抛错：批量操作的常态是部分成功，
 * 整体抛错会连带丢掉已经成功的那部分，让用户重试时重复提交。
 */
export interface BatchFavoriteResult {
  succeededIds: string[];
  failures: BatchFavoriteFailure[];
}
