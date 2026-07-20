import type { RefObject } from "react";

import { liveStore } from "@/lib/live";

/**
 * 活对象登记表：key → 类型（一眼看清本页面有哪些活对象）。
 * hotelListRef：hotel-list 模块的列表容器 ref，供 search-filter 提交后跨模块滚动定位。
 */
export interface PageLiveMap {
  hotelListRef: RefObject<HTMLElement | null>;
}

/** 类型安全读取：key 受 PageLiveMap 约束，返回类型自动推断 */
export const getLive = <K extends keyof PageLiveMap>(key: K) =>
  liveStore.get<PageLiveMap[K]>(key);
