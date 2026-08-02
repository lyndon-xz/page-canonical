import { MOCK_HOTELS } from "./hotels";
import type {
  BatchFavoriteFailure,
  BatchFavoriteResult,
  Hotel,
  HotelPage,
  SearchParams,
} from "../shared/types";

const MOCK_DELAY_MS = 300;

/** 每页条数，故意取小值以便演示滚动加载 */
export const HOTEL_PAGE_SIZE = 3;

/** 该酒店的收藏接口固定失败，用于演示乐观更新后的回滚 */
const FAVORITE_REJECTED_HOTEL_IDS = ["h2"];

const filterHotels = (searchParams: SearchParams): Hotel[] => {
  const keyword = searchParams.keyword.trim().toLowerCase();

  return MOCK_HOTELS.filter((hotel) => {
    const matchesKeyword =
      keyword === "" ||
      hotel.name.toLowerCase().includes(keyword) ||
      hotel.city.toLowerCase().includes(keyword);
    const matchesStar =
      searchParams.star === 0 || hotel.star === searchParams.star;
    return matchesKeyword && matchesStar;
  });
};

export async function fetchHotelPage(
  searchParams: SearchParams,
  page: number,
): Promise<HotelPage> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const matched = filterHotels(searchParams);
  const start = (page - 1) * HOTEL_PAGE_SIZE;
  const items = matched.slice(start, start + HOTEL_PAGE_SIZE);

  return { items, hasMore: start + items.length < matched.length };
}

export async function toggleHotelFavorite(hotelId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (FAVORITE_REJECTED_HOTEL_IDS.includes(hotelId)) {
    throw new Error("收藏服务暂不可用，请稍后再试");
  }
}

/**
 * 批量收藏。整批一次请求，逐项返回成败。
 *
 * 真实服务端的批量接口通常也是这个形状：HTTP 200 + body 里带逐项结果。
 * 只要有一项失败就返回 4xx 会让调用方无法区分「全失败」和「部分失败」。
 */
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
