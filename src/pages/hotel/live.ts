import type { RefObject } from "react";

import { liveStore } from "@/lib/live";

export interface PageLiveMap {
  /** hotel-list 的列表容器，供 search-filter 提交后滚动定位 */
  hotelListRef: RefObject<HTMLElement | null>;
}

export const getLive = <K extends keyof PageLiveMap>(key: K) =>
  liveStore.get<PageLiveMap[K]>(key);
