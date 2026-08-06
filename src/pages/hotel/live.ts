import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { BookingForm } from "./shared/booking";

interface PageLiveMap {
  hotelListRef: RefObject<HTMLElement | null>;
  bookingForm: UseFormReturn<BookingForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
