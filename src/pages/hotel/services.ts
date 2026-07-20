import { MOCK_HOTELS } from "./data/hotels";
import type { Hotel, SearchParams } from "./shared/types";

/** 模拟网络延时，聚焦分层而非请求，不引入任何请求基座 */
const MOCK_DELAY_MS = 300;

/**
 * 异步 mock 取数服务：await 一个小延时后，按关键词（模糊匹配 name/city）
 * 与星级过滤本地 mock 数据返回。
 */
export async function fetchHotels(
  searchParams: SearchParams,
): Promise<Hotel[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

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
}
