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

export interface SearchParams {
  keyword: string;
  /** 星级筛选，0 表示不限 */
  star: number;
}

export type SortBy = "price" | "rating" | "distance";

/**
 * 分页响应。hasMore 由服务端明确给出，不靠「items.length < pageSize」推断——
 * 末页刚好满页时那种推断会多请求一次空页，还会让「加载更多」多闪一下。
 */
export interface HotelPage {
  items: Hotel[];
  hasMore: boolean;
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
