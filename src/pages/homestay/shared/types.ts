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
