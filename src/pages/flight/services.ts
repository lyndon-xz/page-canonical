import { MOCK_FLIGHTS } from "./data/flights";
import type {
  BookingFieldError,
  BookingForm,
  Flight,
  FlightFilters,
} from "./shared/types";

const MOCK_DELAY_MS = 300;

/** 命中的证件号提交预订会被拒，用于演示服务端字段级错误回填 */
const BLOCKED_ID_NUMBERS = ["0000"];

export class BookingSubmitError extends Error {
  readonly fieldErrors: BookingFieldError[];

  constructor(fieldErrors: BookingFieldError[]) {
    super("预订提交失败");
    this.name = "BookingSubmitError";
    this.fieldErrors = fieldErrors;
  }
}

export async function fetchFlights(filters: FlightFilters): Promise<Flight[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return MOCK_FLIGHTS.filter(
    (flight) => filters.cabin === "" || flight.cabin === filters.cabin,
  );
}

export async function submitBooking(values: BookingForm): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_ID_NUMBERS.includes(values.idNumber.trim())) {
    throw new BookingSubmitError([
      { field: "idNumber", message: "该证件号暂不可用，请核对后重试" },
    ]);
  }
}
