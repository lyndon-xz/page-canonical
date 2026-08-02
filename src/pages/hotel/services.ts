import { MOCK_HOTELS } from "./data/hotels";
import type { Hotel, SearchParams } from "./shared/types";

const MOCK_DELAY_MS = 300;

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
