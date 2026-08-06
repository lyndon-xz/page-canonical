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

/**
 * 询价的结果。列表上的 `pricePerNight` 是不带条件的起价，这里才是按具体
 * 入住日期与晚数算出的成交价，两者不必相等。
 */
export interface InquiryQuote {
  /** 逐晚计价后的均价：旺季加价按晚判定，跨月入住时各晚单价并不相同 */
  pricePerNight: number;
  /** 服务端确认的晚数：表单在提交成功后被重置，前端手上不再有它 */
  nights: number;
  /** 已含长住折扣、逐晚加价按晚累计，故不等于均价乘晚数，前端不自行相乘 */
  totalPrice: number;
}

/** 提交成功后服务端给的凭据与报价：撤回凭 id，界面显示其余两项 */
export interface SubmittedInquiry {
  inquiryId: string;
  /** 服务端回显的房源标题：提交成功即退出该房源，报价得靠它说清报的是哪套 */
  listingTitle: string;
  quote: InquiryQuote;
}

export interface InquiryFieldError {
  field: keyof InquiryForm;
  message: string;
}
