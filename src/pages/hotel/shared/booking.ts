/** 常用联系人：与每单重填的行程字段分开，可跨会话复用 */
export interface BookingContact {
  guestName: string;
  phone: string;
}

export interface BookingForm extends BookingContact {
  /** 入住日期，格式 YYYY-MM-DD */
  checkInDate: string;
  nights: number;
  rooms: number;
}

export interface BookingFieldError {
  field: keyof BookingForm;
  message: string;
}
