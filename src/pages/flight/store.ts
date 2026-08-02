import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { isBookingAllowed } from "./shared/gate";
import type {
  BookingEligibility,
  FareBlockReason,
  FareRule,
  Flight,
} from "./shared/types";

function usePageStoreHook() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [flightsError, setFlightsError] = useState<Error | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  /** 为空表示资格尚未取回；闸门此时按不通过处理 */
  const [eligibility, setEligibility] = useState<BookingEligibility | null>(
    null,
  );
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);

  const [fareRules, setFareRules] = useState<FareRule[]>([]);
  const [isLoadingFareRules, setIsLoadingFareRules] = useState(false);
  const [fareRulesError, setFareRulesError] = useState<Error | null>(null);
  const [fareBlockReasons, setFareBlockReasons] = useState<FareBlockReason[]>(
    [],
  );

  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<Error | null>(null);
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
    isLoadingFlights,
    setIsLoadingFlights,
    flightsError,
    setFlightsError,
    selectedFlightId,
    setSelectedFlightId,

    eligibility,
    setEligibility,
    isLoadingEligibility,
    setIsLoadingEligibility,

    fareRules,
    setFareRules,
    isLoadingFareRules,
    setIsLoadingFareRules,
    fareRulesError,
    setFareRulesError,
    fareBlockReasons,
    setFareBlockReasons,

    isSubmittingBooking,
    setIsSubmittingBooking,
    bookingError,
    setBookingError,
    bookingSubmitted,
    setBookingSubmitted,

    isBookingAllowed: bookingAllowed,
    selectedFlight,
  };
}

export const PageStore = createContainer(usePageStoreHook);
