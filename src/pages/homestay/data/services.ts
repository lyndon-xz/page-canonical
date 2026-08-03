import { MOCK_LISTING_DETAILS } from "./listing-details";
import { MOCK_LISTINGS } from "./listings";
import type {
  InquiryFieldError,
  InquiryForm,
  Listing,
  ListingDetail,
  ListingFilters,
} from "../shared/types";

const MOCK_DELAY_MS = 300;

/** 该房源的收藏接口固定失败，用于演示收藏失败的反馈路径 */
const FAVORITE_REJECTED_LISTING_IDS = ["l3"];

/** 命中的手机号提交询价会被拒，用于演示服务端字段级错误回填 */
const BLOCKED_PHONES = ["13800000000"];

export class InquirySubmitError extends Error {
  readonly fieldErrors: InquiryFieldError[];

  constructor(fieldErrors: InquiryFieldError[]) {
    super("询价提交失败");
    this.name = "InquirySubmitError";
    this.fieldErrors = fieldErrors;
  }
}

export async function fetchListings(
  filters: ListingFilters,
): Promise<Listing[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const keyword = filters.keyword.trim().toLowerCase();

  return MOCK_LISTINGS.filter((listing) => {
    const matchesKeyword =
      keyword === "" ||
      listing.title.toLowerCase().includes(keyword) ||
      listing.city.toLowerCase().includes(keyword);
    const matchesRoomType =
      filters.roomType === "" || listing.roomType === filters.roomType;
    return matchesKeyword && matchesRoomType;
  });
}

export async function fetchListingDetail(
  listingId: string,
): Promise<ListingDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return MOCK_LISTING_DETAILS[listingId] ?? null;
}

export async function toggleFavorite(listingId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (FAVORITE_REJECTED_LISTING_IDS.includes(listingId)) {
    throw new Error("收藏服务暂不可用");
  }
}

export async function submitInquiry(values: InquiryForm): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_PHONES.includes(values.phone.trim())) {
    throw new InquirySubmitError([
      { field: "phone", message: "该手机号暂不可用，请更换后重试" },
    ]);
  }
}

export async function cancelInquiry(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}
