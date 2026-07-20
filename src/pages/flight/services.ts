import { MOCK_FLIGHTS } from "./data/flights";
import type {
  BookingFieldError,
  BookingForm,
  Flight,
  FlightFilters,
} from "./shared/types";

/** 模拟网络延时，聚焦分层而非请求，不引入任何请求基座 */
const MOCK_DELAY_MS = 300;

/** 模拟服务端黑名单：命中的证件号提交预订会被拒，用于演示字段级错误回填 */
const BLOCKED_ID_NUMBERS = ["0000"];

/**
 * 预订提交失败错误：携带服务端字段级错误。
 * action 捕获后经 getLive 取表单实例、把 fieldErrors 映射回 setError（映射逻辑在 action，不进 UI）。
 */
export class BookingSubmitError extends Error {
  readonly fieldErrors: BookingFieldError[];

  constructor(fieldErrors: BookingFieldError[]) {
    super("预订提交失败");
    this.name = "BookingSubmitError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * 异步 mock 取数服务：await 一个小延时后，按舱位过滤本地 mock 数据返回。
 * cabin 为空串表示不限。
 */
export async function fetchFlights(filters: FlightFilters): Promise<Flight[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return MOCK_FLIGHTS.filter(
    (flight) => filters.cabin === "" || flight.cabin === filters.cabin,
  );
}

/**
 * 异步 mock 提交服务：await 一个小延时后，命中黑名单证件号则抛 BookingSubmitError（模拟失败），
 * 否则视为成功。全程只接收 / 返回可序列化的纯值。
 */
export async function submitBooking(values: BookingForm): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_ID_NUMBERS.includes(values.idNumber.trim())) {
    throw new BookingSubmitError([
      { field: "idNumber", message: "该证件号暂不可用，请核对后重试" },
    ]);
  }
}
