export interface Listing {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
  rating: number;
  roomType: string;
}

/** 本页暂无筛选 UI，目前只由 URL query 填充 */
export interface ListingFilters {
  keyword: string;
  /** 房型筛选，空串表示不限 */
  roomType: string;
}

/** 比列表项多出的描述类字段，单独接口按需拉取 */
export interface ListingDetail {
  listingId: string;
  description: string;
  amenities: string[];
  hostName: string;
  cancellationPolicy: string;
}

export enum ConfirmScene {
  RemoveFavorite = "removeFavorite",
  CancelInquiry = "cancelInquiry",
}

export interface InquiryForm {
  guestName: string;
  phone: string;
  /** 入住日期，格式 YYYY-MM-DD */
  checkInDate: string;
  nights: number;
  message: string;
}

/**
 * 询价的完整报文。房源不是用户填的字段，由页面上下文的选中态注入。
 * 不带价格：服务端按房源与入住日期自行计价，前端传价会被篡改。
 */
export interface InquiryPayload extends InquiryForm {
  listingId: string;
}

export interface InquiryFieldError {
  field: keyof InquiryForm;
  message: string;
}
