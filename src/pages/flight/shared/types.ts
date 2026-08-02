export interface Flight {
  id: string;
  airline: string;
  /** 航班号，如 CA1234 */
  flightNo: string;
  from: string;
  to: string;
  /** 起飞时间，HH:mm */
  departTime: string;
  /** 到达时间，HH:mm */
  arriveTime: string;
  price: number;
  /** 舱位：经济舱 / 商务舱 / 头等舱 */
  cabin: string;
}

export interface FlightFilters {
  /** 舱位筛选，空串表示不限 */
  cabin: string;
}

export type SortBy = "price" | "departTime";

/** 放在 shared/ 而非模块内，以便 live 层与 flight-results 共用同一类型 */
export interface FlightResultsHandle {
  scrollToTop: () => void;
}

export interface BookingForm {
  passengerName: string;
  idNumber: string;
  contactPhone: string;
}

export interface BookingFieldError {
  field: keyof BookingForm;
  message: string;
}
