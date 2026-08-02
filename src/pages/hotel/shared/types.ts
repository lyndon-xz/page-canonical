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
