import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { BookingForm } from "./shared/types";

interface PageLiveMap {
  /** flight-results 的列表容器，供 search-bar 提交后滚动定位 */
  flightResultsRef: RefObject<HTMLElement | null>;
  /** booking-form 的表单实例，供 action 回写（reset / setError） */
  bookingForm: UseFormReturn<BookingForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
