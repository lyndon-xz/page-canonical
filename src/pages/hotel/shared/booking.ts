export interface BookingContact {
  guestName: string;
  phone: string;
}

export interface BookingForm extends BookingContact {
  checkInDate: string;
  nights: number;
  rooms: number;
}

export interface BookingFieldError {
  field: keyof BookingForm;
  message: string;
}
