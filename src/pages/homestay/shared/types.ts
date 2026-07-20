/** 民宿领域模型：跨模块共用，放页面 shared/ */
export interface Listing {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
  rating: number;
  /** 房型：整套 / 单间 / 合住 */
  roomType: string;
}

/** 列表筛选条件：写入页面 store 的 appliedFilters（本页暂无筛选 UI，预留取数入参） */
export interface ListingFilters {
  keyword: string;
  /** 房型筛选，空串表示不限 */
  roomType: string;
}

/**
 * 询价表单：非结构化「活对象」（useForm 实例）承载的纯值形状。
 * 表单实例本身进 liveStore（见 live.ts），不进 store 的可序列化 state。
 */
export interface InquiryForm {
  guestName: string;
  phone: string;
  /** 入住日期，格式 YYYY-MM-DD */
  checkInDate: string;
  /** 入住晚数 */
  nights: number;
  message: string;
}

/** 服务端字段级校验错误：提交失败时由 action 经 getLive 回填到表单（§0.4 交接传纯值、回写走 getLive） */
export interface InquiryFieldError {
  field: keyof InquiryForm;
  message: string;
}
