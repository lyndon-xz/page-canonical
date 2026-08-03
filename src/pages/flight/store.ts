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

  /** 当前这份结果集是按什么条件取回的 */
  const [appliedFilters, setAppliedFilters] =
    useState<FlightFilters>(DEFAULT_FILTERS);

  /** 为空表示资格未取回或取回失败，闸门一律按不通过处理 */
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

  const bookingAllowed = useMemo(
    () => isBookingAllowed(eligibility),
    [eligibility],
  );

  /** 提到页面层，避免多个模块各 find 一遍 */
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

    /** 已求值的布尔，不是 gate.ts 的同名函数 */
    isBookingAllowed: bookingAllowed,
    selectedFlight,
  };
}

export const PageStore = createContainer(usePageStoreHook);
