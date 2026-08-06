import dayjs from "dayjs";

import type { ListingFilters } from "../shared/filters";
import type {
  InquiryFieldError,
  InquiryPayload,
  InquiryQuote,
  SubmittedInquiry,
} from "../shared/inquiry";
import type { Listing, ListingDetail } from "../shared/listing";

import { MOCK_LISTING_DETAILS } from "./listing-details";
import { MOCK_LISTINGS } from "./listings";

const MOCK_DELAY_MS = 300;

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

// 该房源的收藏接口固定失败，用于演示收藏失败的反馈路径
const FAVORITE_REJECTED_LISTING_IDS = ["l3"];

export async function toggleFavorite(listingId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (FAVORITE_REJECTED_LISTING_IDS.includes(listingId)) {
    throw new Error("收藏服务暂不可用");
  }
}

// 旺季单价上浮，报价因此与列表起价不同
const PEAK_MONTHS = [7, 8];
const PEAK_SURCHARGE_RATE = 1.2;

// 住满这么多晚打折，总价因此不是单价乘晚数
const LONG_STAY_NIGHTS = 7;
const LONG_STAY_DISCOUNT = 0.9;

function buildQuote(listing: Listing, payload: InquiryPayload): InquiryQuote {
  const { checkInDate, nights } = payload;
  const { pricePerNight: basePrice } = listing;

  // 逐晚判定旺季：一段入住可能跨月，整段按入住月算会把跨出旺季的那几晚也加上价
  let gross = 0;
  for (let night = 0; night < nights; night += 1) {
    // checkInDate 的格式由 InquiryForm 约定为 YYYY-MM-DD
    const month = dayjs(checkInDate).add(night, "day").month() + 1;
    const rate = PEAK_MONTHS.includes(month) ? PEAK_SURCHARGE_RATE : 1;

    gross += Math.round(basePrice * rate);
  }

  return {
    pricePerNight: Math.round(gross / nights),
    nights,
    totalPrice:
      nights >= LONG_STAY_NIGHTS
        ? Math.round(gross * LONG_STAY_DISCOUNT)
        : gross,
  };
}

// 命中的手机号提交询价会被拒，用于演示服务端字段级错误回填
const BLOCKED_PHONES = ["13800000000"];

// 询价 id 的前缀，撤回时据此判断 id 是否出自本服务
const INQUIRY_ID_PREFIX = "iq-";

export class InquirySubmitError extends Error {
  readonly fieldErrors: InquiryFieldError[];

  constructor(fieldErrors: InquiryFieldError[]) {
    super("询价提交失败");
    this.name = "InquirySubmitError";
    this.fieldErrors = fieldErrors;
  }
}

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<SubmittedInquiry> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_PHONES.includes(payload.phone.trim())) {
    throw new InquirySubmitError([
      { field: "phone", message: "该手机号暂不可用，请更换后重试" },
    ]);
  }

  const listing = MOCK_LISTINGS.find((item) => item.id === payload.listingId);

  // 房源可能在用户填表期间下架，此时无从计价
  if (!listing) {
    throw new Error("该房源已下架，请重新选择");
  }

  return {
    inquiryId: `${INQUIRY_ID_PREFIX}${listing.id}-${Date.now()}`,
    listingTitle: listing.title,
    quote: buildQuote(listing, payload),
  };
}

export async function cancelInquiry(inquiryId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (!inquiryId.startsWith(INQUIRY_ID_PREFIX)) {
    throw new Error("询价不存在或已撤回");
  }
}
