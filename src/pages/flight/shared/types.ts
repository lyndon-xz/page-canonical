export interface Flight {
  id: string;
  airline: string;
  flightNo: string;
  from: string;
  to: string;
  /** 起飞时间，HH:mm */
  departTime: string;
  /** 到达时间，HH:mm */
  arriveTime: string;
  price: number;
  cabin: string;
}

export interface FlightFilters {
  /** 舱位筛选，空串表示不限 */
  cabin: string;
}

/** 排序值的单一来源：比较器、排序按钮都由此派生 */
export const SORT_BY_VALUES = ["price", "departTime"] as const;

export type SortBy = (typeof SORT_BY_VALUES)[number];

/** 闸门的三个输入 */
export interface BookingEligibility {
  canBook: boolean;
  /** 所选航线是否在可售范围 */
  routeOpen: boolean;
  seatsAvailable: boolean;
}

/** 服务端下发的规则标识 */
export enum FareRuleType {
  ChangeFee = "changeFee",
  RefundFee = "refundFee",
  FreeChangeCount = "freeChangeCount",
  BaggageAllowance = "baggageAllowance",
  SeatSelection = "seatSelection",
  MileageAccrual = "mileageAccrual",
}

export interface FareRule {
  ruleType: FareRuleType;
  /** 服务端判定的合格与否，仅表示数值本身是否达标 */
  qualified: boolean;
  /** 当前取值的展示文本，如 "¥200" "2 次" */
  currentValue: string;
}

/** 命中后关联规则一律按不合格展示，数值达标也不算（如航班已起飞） */
export enum FareBlockReason {
  Departed = "departed",
  SoldOut = "soldOut",
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
