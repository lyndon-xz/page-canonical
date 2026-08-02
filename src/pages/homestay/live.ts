import type { UseFormReturn } from "react-hook-form";

import { liveStore } from "@/lib/live";

import type { InquiryForm } from "./shared/types";

export interface PageLiveMap {
  /** 询价表单实例，供 action 回写（reset / setError） */
  inquiryForm: UseFormReturn<InquiryForm>;
}

export const getLive = <K extends keyof PageLiveMap>(key: K) =>
  liveStore.get<PageLiveMap[K]>(key);
