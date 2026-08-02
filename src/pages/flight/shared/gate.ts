import type { BookingEligibility } from "./types";

/**
 * 预订能力闸门：三项资格全通过才开放预订与退改规则。
 *
 * 收敛成纯函数而非写在 selector 里，是因为它同时被两处消费：
 * 页面 action 用它决定「要不要继续拉后续数据」，selector 用它决定「模块要不要渲染」。
 * 两处若各判一次，加条件时必然漏改一处。
 */
export function isBookingAllowed(eligibility: BookingEligibility | null) {
  if (!eligibility) {
    return false;
  }

  const { canBook, routeOpen, seatsAvailable } = eligibility;

  return canBook && routeOpen && seatsAvailable;
}
