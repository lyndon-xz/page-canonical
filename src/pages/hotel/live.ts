import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import { createPageLive } from "@/lib/live";

import type { BookingForm } from "./shared/types";

interface PageLiveMap {
  /** hotel-list 的列表容器，供页面层换搜索条件后滚动回顶；筛选与排序都会触发 */
  hotelListRef: RefObject<HTMLElement | null>;
  /** booking-form 的表单实例，供 action 回写（resetField / setError） */
  bookingForm: UseFormReturn<BookingForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
