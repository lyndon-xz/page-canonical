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
  pricePerNight: number;
  nights: number;
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
