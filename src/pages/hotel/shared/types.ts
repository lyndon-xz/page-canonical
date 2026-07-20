/** 酒店领域模型：跨模块共用，放页面 shared/ */
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

/** 搜索条件：由 search-filter 模块提交、写入页面 store */
export interface SearchParams {
  keyword: string;
  /** 星级筛选，0 表示不限 */
  star: number;
}

/** 排序维度：hotel-list 模块本地状态 */
export type SortBy = "price" | "rating" | "distance";
