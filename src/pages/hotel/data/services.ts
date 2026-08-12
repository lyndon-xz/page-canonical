import type { BookingFieldError, BookingForm } from "../shared/booking";
import type {
  BatchFavoriteFailure,
  BatchFavoriteResult,
} from "../shared/favorite";
import { mockDelay } from "@/lib/mock-delay";

import type { Hotel, HotelPageResult } from "../shared/hotel";
import type { SearchParams, SortBy } from "../shared/params";

import { MOCK_HOTELS } from "./hotels";

const SORT_COMPARATORS: Record<SortBy, (a: Hotel, b: Hotel) => number> = {
  price: (a, b) => a.pricePerNight - b.pricePerNight,
  rating: (a, b) => b.rating - a.rating,
  distance: (a, b) => a.distanceKm - b.distanceKm,
};

const resolveMatchedHotels = (searchParams: SearchParams): Hotel[] => {
  const { keyword, star, sortBy } = searchParams;
  const normalizedKeyword = keyword.trim().toLowerCase();

  return MOCK_HOTELS.filter((hotel) => {
    const { name, city, star: hotelStar } = hotel;

    const isKeywordMatched =
      normalizedKeyword === "" ||
      name.toLowerCase().includes(normalizedKeyword) ||
      city.toLowerCase().includes(normalizedKeyword);
    const isStarMatched = star === 0 || hotelStar === star;
    return isKeywordMatched && isStarMatched;
  }).sort(SORT_COMPARATORS[sortBy]);
};

const HOTEL_PAGE_SIZE = 12;

const SEARCH_REJECTED_KEYWORD = "error";

export async function fetchHotelPage(
  searchParams: SearchParams,
  page: number,
): Promise<HotelPageResult> {
  await mockDelay();

  if (searchParams.keyword.trim().toLowerCase() === SEARCH_REJECTED_KEYWORD) {
    throw new Error("酒店列表服务暂不可用");
  }

  const matched = resolveMatchedHotels(searchParams);
  const start = (page - 1) * HOTEL_PAGE_SIZE;
  const items = matched.slice(start, start + HOTEL_PAGE_SIZE);
  const total = matched.length;

  return {
    items,
    hasMore: start + items.length < total,
    total,
  };
}

const FAVORITE_REJECTED_HOTEL_IDS = ["h2"];

export async function toggleHotelFavorite(hotelId: string): Promise<void> {
  await mockDelay();

  if (FAVORITE_REJECTED_HOTEL_IDS.includes(hotelId)) {
    throw new Error("收藏服务暂不可用，请稍后再试");
  }
}

export async function batchFavoriteHotels(
  hotelIds: string[],
): Promise<BatchFavoriteResult> {
  await mockDelay();

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

const BOOKING_REJECTED_HOTEL_IDS = ["h5"];

const BLOCKED_PHONES = ["13800000000"];

export class BookingSubmitError extends Error {
  readonly fieldErrors: BookingFieldError[];

  constructor(fieldErrors: BookingFieldError[]) {
    super("预订提交失败");
    this.name = "BookingSubmitError";
    this.fieldErrors = fieldErrors;
  }
}

export async function submitBooking(
  hotelId: string,
  values: BookingForm,
): Promise<void> {
  await mockDelay();

  if (BOOKING_REJECTED_HOTEL_IDS.includes(hotelId)) {
    throw new Error("该酒店已订满，换一家试试");
  }

  if (BLOCKED_PHONES.includes(values.phone.trim())) {
    throw new BookingSubmitError([
      { field: "phone", message: "该手机号暂不可用，请更换后重试" },
    ]);
  }
}
