import type { RefObject } from "react";

import { createPageLive } from "@/lib/live";

interface PageLiveMap {
  /** hotel-list 的列表容器，供 search-filter 提交后滚动定位 */
  hotelListRef: RefObject<HTMLElement | null>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
