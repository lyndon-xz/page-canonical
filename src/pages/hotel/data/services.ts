import { MOCK_HOTELS } from "./hotels";
import type {
  BatchFavoriteFailure,
  BatchFavoriteResult,
  Hotel,
  HotelPage,
  SearchParams,
  SortBy,
} from "../shared/types";

const MOCK_DELAY_MS = 300;

/** 取值要让首屏填满一屏以上，否则末尾哨兵一开始就在视口内，会连锁翻页直到取完 */
const HOTEL_PAGE_SIZE = 12;

const comparators: Record<SortBy, (a: Hotel, b: Hotel) => number> = {
  price: (a, b) => a.pricePerNight - b.pricePerNight,
  rating: (a, b) => b.rating - a.rating,
  distance: (a, b) => a.distanceKm - b.distanceKm,
};

/** 该酒店的收藏接口固定失败，用于演示乐观更新后的回滚 */
const FAVORITE_REJECTED_HOTEL_IDS = ["h2"];

const resolveMatchedHotels = (searchParams: SearchParams): Hotel[] => {
  const keyword = searchParams.keyword.trim().toLowerCase();

  return MOCK_HOTELS.filter((hotel) => {
    const matchesKeyword =
      keyword === "" ||
      hotel.name.toLowerCase().includes(keyword) ||
      hotel.city.toLowerCase().includes(keyword);
    const matchesStar =
      searchParams.star === 0 || hotel.star === searchParams.star;
    return matchesKeyword && matchesStar;
  }).sort(comparators[searchParams.sortBy]);
};

export async function fetchHotelPage(
  searchParams: SearchParams,
  page: number,
): Promise<HotelPage> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const matched = resolveMatchedHotels(searchParams);
  const start = (page - 1) * HOTEL_PAGE_SIZE;
  const items = matched.slice(start, start + HOTEL_PAGE_SIZE);

  return {
    items,
    hasMore: start + items.length < matched.length,
    total: matched.length,
  };
}

export async function toggleHotelFavorite(hotelId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (FAVORITE_REJECTED_HOTEL_IDS.includes(hotelId)) {
    throw new Error("收藏服务暂不可用，请稍后再试");
  }
}

/** 整批一次请求，逐项返回成败 */
export async function batchFavoriteHotels(
  hotelIds: string[],
): Promise<BatchFavoriteResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const succeededIds: string[] = [];
  const failures: BatchFavoriteFailure[] = [];

  hotelIds.forEach((hotelId) => {
    if (FAVORITE_REJECTED_HOTEL_IDS.includes(hotelId)) {
      failures.push({ hotelId, reason: "收藏服务暂不可用" });
      return;
    }
    succeededIds.push(hotelId);
  });

  return { succeededIds, failures };
}
