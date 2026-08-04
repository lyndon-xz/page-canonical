import { MOCK_FARE_BLOCK_REASONS, MOCK_FARE_RULES } from "./fare-rules";
import { MOCK_FLIGHTS } from "./flights";
import type {
  BookingEligibility,
  BookingFieldError,
  BookingForm,
  FareBlockReason,
  FareRule,
  Flight,
  FlightFilters,
} from "../shared/types";

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

/** mock 用单接口返回三项资格 */
export async function fetchBookingEligibility(): Promise<BookingEligibility> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return { canBook: true, routeOpen: true, seatsAvailable: true };
}

export async function fetchFlights(filters: FlightFilters): Promise<Flight[]> {
  const { cabin } = filters;

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return MOCK_FLIGHTS.filter(
    (flight) => cabin === "" || flight.cabin === cabin,
  );
}

export async function fetchFareRules(flightId: string): Promise<FareRule[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return MOCK_FARE_RULES[flightId] ?? [];
}

export async function fetchFareBlockReasons(
  flightId: string,
): Promise<FareBlockReason[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return MOCK_FARE_BLOCK_REASONS[flightId] ?? [];
}

export async function submitBooking(values: BookingForm): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (BLOCKED_ID_NUMBERS.includes(values.idNumber.trim())) {
    throw new BookingSubmitError([
      { field: "idNumber", message: "该证件号暂不可用，请核对后重试" },
    ]);
  }
}
