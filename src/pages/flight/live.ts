import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { BookingForm, FlightResultsHandle } from "./shared/types";

interface PageLiveMap {
  /** flight-results 暴露的句柄，供 search-bar 提交后滚动定位 */
  flightResults: RefObject<FlightResultsHandle | null>;
  /** booking-form 的表单实例，供 action 回写（reset / setError） */
  bookingForm: UseFormReturn<BookingForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
