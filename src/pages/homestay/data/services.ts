import { MOCK_LISTING_DETAILS } from "./listing-details";
import { MOCK_LISTINGS } from "./listings";
import type {
  InquiryFieldError,
  InquiryPayload,
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

export interface InquirySubmitResult {
  /** 撤回凭据：撤的是这条询价，与撤回时页面在看哪套房无关 */
  inquiryId: string;
}

export async function fetchListings(
  filters: ListingFilters,
): Promise<Listing[]> {
  const { keyword, roomType } = filters;

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  // 归一化后的关键词换个名字，避开解构出的原始 keyword
  const normalizedKeyword = keyword.trim().toLowerCase();

  return MOCK_LISTINGS.filter((listing) => {
    // 房源的 roomType 重命名，避开筛选条件里的同名字段
    const { title, city, roomType: listingRoomType } = listing;

    const matchesKeyword =
      normalizedKeyword === "" ||
      title.toLowerCase().includes(normalizedKeyword) ||
      city.toLowerCase().includes(normalizedKeyword);
    const matchesRoomType = roomType === "" || listingRoomType === roomType;
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

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<InquirySubmitResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_PHONES.includes(payload.phone.trim())) {
    throw new InquirySubmitError([
      { field: "phone", message: "该手机号暂不可用，请更换后重试" },
    ]);
  }

  return { inquiryId: `iq-${payload.listingId}-${Date.now()}` };
}

export async function cancelInquiry(inquiryId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (!inquiryId) {
    throw new Error("询价不存在或已撤回");
  }
}
