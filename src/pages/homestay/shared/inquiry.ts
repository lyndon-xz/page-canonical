export interface InquiryForm {
  guestName: string;
  phone: string;
  checkInDate: string;
  nights: number;
  message: string;
}

export interface InquiryPayload extends InquiryForm {
  listingId: string;
}

export interface InquiryQuote {
  nights: number;
  /** 旺季加价摊平后的每晚均价，仅用于展示，不参与合计的算术 */
  nightlyAverage: number;
  grossPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface SubmittedInquiry {
  inquiryId: string;
  listingTitle: string;
  quote: InquiryQuote;
}

export interface InquiryFieldError {
  field: keyof InquiryForm;
  message: string;
}
