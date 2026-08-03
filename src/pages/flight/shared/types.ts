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

/** 预订资格：闸门的三个输入，由三个独立接口并行取回 */
export interface BookingEligibility {
  /** 当前账号是否有预订权限 */
  canBook: boolean;
  /** 所选航线是否在可售范围 */
  routeOpen: boolean;
  /** 余位是否充足 */
  seatsAvailable: boolean;
}

/** 退改规则的类型标识，服务端下发；前端据此索引到本地规则定义 */
export enum FareRuleType {
  ChangeFee = "changeFee",
  RefundFee = "refundFee",
  FreeChangeCount = "freeChangeCount",
  BaggageAllowance = "baggageAllowance",
  SeatSelection = "seatSelection",
  MileageAccrual = "mileageAccrual",
}

/** 单条退改规则的服务端数据；是否合格由服务端判定，展示态另受阻断原因影响 */
export interface FareRule {
  ruleType: FareRuleType;
  /** 服务端判定的合格与否，仅表示数值本身是否达标 */
  qualified: boolean;
  /** 当前取值的展示文本，如 "¥200" "2 次" */
  currentValue: string;
}

/**
 * 整班次级别的阻断原因：命中后所有关联规则一律按不合格展示，
 * 即使 FareRule.qualified 为 true（如航班已起飞，改签费再低也用不上）。
 */
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
