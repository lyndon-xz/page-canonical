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

export const DEFAULT_CONTACT: BookingContact = {
  guestName: "",
  phone: "",
};

const { guestName: defaultGuestName, phone: defaultPhone } = DEFAULT_CONTACT;

/** 落盘的联系人不可信：逐字段判类型，不合法就回落到默认值 */
export function readPersistedContact(value: unknown): BookingContact {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_CONTACT;
  }

  const guestName =
    "guestName" in value && typeof value.guestName === "string"
      ? value.guestName
      : defaultGuestName;
  const phone =
    "phone" in value && typeof value.phone === "string"
      ? value.phone
      : defaultPhone;

  return {
    guestName,
    phone,
  };
}
