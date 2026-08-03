import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { FetchStatus } from "@/lib/fetch-status";

import { isBookingAllowed } from "./shared/gate";
import type {
  BookingEligibility,
  FareBlockReason,
  FareRule,
  Flight,
  FlightFilters,
} from "./shared/types";

const DEFAULT_FILTERS: FlightFilters = { cabin: "" };

function usePageStoreHook() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightsStatus, setFlightsStatus] = useState<FetchStatus>(
    FetchStatus.Ready,
  );
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  /** 已生效的筛选条件，即当前这份结果集是按什么条件取回的；编辑中的草稿在 search-bar */
  const [appliedFilters, setAppliedFilters] =
    useState<FlightFilters>(DEFAULT_FILTERS);

  /**
   * 为空表示资格尚未取回或取回失败；闸门此时一律按不通过处理。
   *
   * 没有配套的 loading 与 error：闸门期间受它管的两个模块本就不渲染，
   * 「校验中」与「不通过」在界面上是同一种表现，多存的状态没有读者。
   */
  const [eligibility, setEligibility] = useState<BookingEligibility | null>(
    null,
  );

  const [fareRules, setFareRules] = useState<FareRule[]>([]);
  const [fareBlockReasons, setFareBlockReasons] = useState<FareBlockReason[]>(
    [],
  );
  const [fareRulesStatus, setFareRulesStatus] = useState<FetchStatus>(
    FetchStatus.Ready,
  );

  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  /**
   * 闸门结论收在页面层：预订与退改规则两个模块都据此决定是否渲染，
   * 各自再判一次就会和 action 里的判定漂移（见 shared/gate.ts）。
   */
  const bookingAllowed = useMemo(
    () => isBookingAllowed(eligibility),
    [eligibility],
  );

  /** 选中航班：booking-form 与 fare-rules 都要，故提到页面层，避免两处各 find 一遍 */
  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) ?? null,
    [flights, selectedFlightId],
  );

  return {
    flights,
    setFlights,
    flightsStatus,
    setFlightsStatus,
    appliedFilters,
    setAppliedFilters,
    selectedFlightId,
    setSelectedFlightId,

    eligibility,
    setEligibility,

    fareRules,
    setFareRules,
    fareBlockReasons,
    setFareBlockReasons,
    fareRulesStatus,
    setFareRulesStatus,

    isSubmittingBooking,
    setIsSubmittingBooking,
    bookingSubmitted,
    setBookingSubmitted,

    isBookingAllowed: bookingAllowed,
    selectedFlight,
  };
}

export const PageStore = createContainer(usePageStoreHook);
