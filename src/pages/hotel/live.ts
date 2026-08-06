import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { BookingForm } from "./shared/booking";

interface PageLiveMap {
  bookingForm: UseFormReturn<BookingForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
