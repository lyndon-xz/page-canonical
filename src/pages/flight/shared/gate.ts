import type { BookingEligibility } from "./types";

/** 三项资格全通过才开放预订与退改规则 */
export function isBookingAllowed(eligibility: BookingEligibility | null) {
  if (!eligibility) {
    return false;
  }

  const { canBook, routeOpen, seatsAvailable } = eligibility;

  return canBook && routeOpen && seatsAvailable;
}
