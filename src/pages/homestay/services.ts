import { MOCK_LISTINGS } from "./data/listings";
import type {
  InquiryFieldError,
  InquiryForm,
  Listing,
  ListingFilters,
} from "./shared/types";

/** 模拟网络延时，聚焦分层而非请求，不引入任何请求基座 */
const MOCK_DELAY_MS = 300;

/** 模拟服务端黑名单：命中的手机号提交询价会被拒，用于演示字段级错误回填 */
const BLOCKED_PHONES = ["13800000000"];

/**
 * 提交失败错误：携带服务端字段级错误。
 * action 捕获后经 getLive 取表单实例、把 fieldErrors 映射回 setError（映射逻辑在 action，不进 UI）。
 */
export class InquirySubmitError extends Error {
  readonly fieldErrors: InquiryFieldError[];

  constructor(fieldErrors: InquiryFieldError[]) {
    super("询价提交失败");
    this.name = "InquirySubmitError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * 异步 mock 取数服务：await 一个小延时后，按关键词（模糊匹配 title/city）
 * 与房型过滤本地 mock 数据返回。
 */
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

/**
 * 异步 mock 提交服务：await 一个小延时后，命中黑名单手机号则抛 InquirySubmitError（模拟失败），
 * 否则视为成功。全程只接收 / 返回可序列化的纯值。
 */
export async function submitInquiry(values: InquiryForm): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_PHONES.includes(values.phone.trim())) {
    throw new InquirySubmitError([
      { field: "phone", message: "该手机号暂不可用，请更换后重试" },
    ]);
  }
}
