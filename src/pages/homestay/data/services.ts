import dayjs from 'dayjs';

import type { ListingFilters } from '../shared/filters';
import type {
  InquiryFieldError,
  InquiryPayload,
  InquiryQuote,
  SubmittedInquiry,
} from '../shared/inquiry';
import type { Listing, ListingDetail } from '../shared/listing';

import { MOCK_LISTING_DETAILS } from './listing-details';
import { MOCK_LISTINGS } from './listings';

const MOCK_DELAY_MS = 300;

function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

const LIST_REJECTED_KEYWORD = 'error';

export async function fetchListings(filters: ListingFilters): Promise<Listing[]> {
  const { keyword, roomType } = filters;

  await mockDelay();

  const normalizedKeyword = keyword.trim().toLowerCase();

  if (normalizedKeyword === LIST_REJECTED_KEYWORD) {
    throw new Error('房源列表服务暂不可用');
  }

  return MOCK_LISTINGS.filter((listing) => {
    const { title, city, roomType: listingRoomType } = listing;

    const isKeywordMatched =
      normalizedKeyword === '' ||
      title.toLowerCase().includes(normalizedKeyword) ||
      city.toLowerCase().includes(normalizedKeyword);
    const isRoomTypeMatched = roomType === '' || listingRoomType === roomType;
    return isKeywordMatched && isRoomTypeMatched;
  });
}

const DETAIL_REJECTED_LISTING_IDS = ['l4'];

export async function fetchListingDetail(listingId: string): Promise<ListingDetail | null> {
  await mockDelay();

  if (DETAIL_REJECTED_LISTING_IDS.includes(listingId)) {
    throw new Error('房源详情服务暂不可用');
  }

  return MOCK_LISTING_DETAILS[listingId] ?? null;
}

const FAVORITE_REJECTED_LISTING_IDS = ['l3'];

export async function toggleFavorite(listingId: string): Promise<void> {
  await mockDelay();

  if (FAVORITE_REJECTED_LISTING_IDS.includes(listingId)) {
    throw new Error('收藏服务暂不可用');
  }
}

const PEAK_MONTHS = [7, 8];
const PEAK_SURCHARGE_RATE = 1.2;

const LONG_STAY_MIN_NIGHTS = 7;
const LONG_STAY_PRICE_RATE = 0.9;

function buildQuote(pricePerNight: number, checkInDate: string, nights: number): InquiryQuote {
  let grossPrice = 0;
  for (let night = 0; night < nights; night += 1) {
    const month = dayjs(checkInDate).add(night, 'day').month() + 1;
    const rate = PEAK_MONTHS.includes(month) ? PEAK_SURCHARGE_RATE : 1;

    grossPrice += Math.round(pricePerNight * rate);
  }

  const discountAmountYuan =
    nights >= LONG_STAY_MIN_NIGHTS ? grossPrice - Math.round(grossPrice * LONG_STAY_PRICE_RATE) : 0;

  return {
    nights,
    nightlyAverage: Math.round(grossPrice / nights),
    grossPrice,
    discountAmountYuan,
    totalPrice: grossPrice - discountAmountYuan,
  };
}

const BLOCKED_PHONES = ['13800000000'];

const INQUIRY_ID_PREFIX = 'iq-';

export class InquirySubmitError extends Error {
  readonly fieldErrors: InquiryFieldError[];

  constructor(fieldErrors: InquiryFieldError[]) {
    super('询价提交失败');
    this.name = 'InquirySubmitError';
    this.fieldErrors = fieldErrors;
  }
}

export async function submitInquiry(payload: InquiryPayload): Promise<SubmittedInquiry> {
  const { phone, listingId, checkInDate, nights } = payload;

  await mockDelay();

  if (BLOCKED_PHONES.includes(phone.trim())) {
    throw new InquirySubmitError([{ field: 'phone', message: '该手机号暂不可用，请更换后重试' }]);
  }

  const listing = MOCK_LISTINGS.find((item) => item.id === listingId);

  if (!listing) {
    throw new Error('该房源已下架，请重新选择');
  }

  const { id, title, pricePerNight } = listing;

  return {
    inquiryId: `${INQUIRY_ID_PREFIX}${id}-${Date.now()}`,
    listingTitle: title,
    quote: buildQuote(pricePerNight, checkInDate, nights),
  };
}

export async function cancelInquiry(inquiryId: string): Promise<void> {
  await mockDelay();

  if (!inquiryId.startsWith(INQUIRY_ID_PREFIX)) {
    throw new Error('询价不存在或已撤回');
  }
}
