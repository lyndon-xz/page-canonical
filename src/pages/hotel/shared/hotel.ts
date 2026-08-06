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

/** hasMore 由服务端给出，不靠 items.length < pageSize 推断——末页满页时会多请求一次空页 */
export interface HotelPage {
  items: Hotel[];
  hasMore: boolean;
  /** 匹配筛选条件的总条数，与本页取回多少条无关 */
  total: number;
}
