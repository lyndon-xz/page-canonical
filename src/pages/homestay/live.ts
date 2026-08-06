import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { InquiryForm } from "./shared/inquiry";

interface PageLiveMap {
  // 询价表单实例，供 action 回写（reset / setError）
  inquiryForm: UseFormReturn<InquiryForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
