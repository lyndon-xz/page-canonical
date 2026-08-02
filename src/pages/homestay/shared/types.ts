export interface Listing {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
  rating: number;
  /** 房型：整套 / 单间 / 合住 */
  roomType: string;
}

/** 本页暂无筛选 UI，目前只由 URL query 填充 */
export interface ListingFilters {
  keyword: string;
  /** 房型筛选，空串表示不限 */
  roomType: string;
}

export interface InquiryForm {
  guestName: string;
  phone: string;
  /** 入住日期，格式 YYYY-MM-DD */
  checkInDate: string;
  nights: number;
  message: string;
}

export interface InquiryFieldError {
  field: keyof InquiryForm;
  message: string;
}

/** 房源详情，比列表项多出描述、设施与退订政策，单独接口按需拉取 */
export interface ListingDetail {
  listingId: string;
  description: string;
  amenities: string[];
  hostName: string;
  /** 退订政策说明 */
  cancellationPolicy: string;
}

/**
 * 二次确认的触发场景。
 *
 * 两个场景的提交动作不同，但弹窗结构完全一致、只有文案有别，
 * 因此共用一个确认弹窗模块，由场景决定文案与提交分支——
 * 复制两份弹窗会让「确认中」的 loading、关闭时机各写一遍。
 */
export enum ConfirmScene {
  RemoveFavorite = "removeFavorite",
  CancelInquiry = "cancelInquiry",
}
