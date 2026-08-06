import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { InquiryForm } from "./shared/inquiry";

interface PageLiveMap {
  inquiryForm: UseFormReturn<InquiryForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
