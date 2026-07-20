import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import { liveStore } from "@/lib/live";

import type { BookingForm, FlightResultsHandle } from "./shared/types";

/**
 * 活对象登记表：key → 类型（一眼看清本页面有哪些活对象）。
 * - flightResults：flight-results 模块经 useImperativeHandle 暴露的命令式句柄 ref，供 search-bar 提交后跨模块滚动定位。
 * - bookingForm：booking-form 模块的 useForm 实例，供纯对象 action 经 getLive 命令式回写（reset / setError）。
 * 二者均不进 store 的可序列化 state。
 */
export interface PageLiveMap {
  flightResults: RefObject<FlightResultsHandle | null>;
  bookingForm: UseFormReturn<BookingForm>;
}

/** 类型安全读取：key 受 PageLiveMap 约束，返回类型自动推断 */
export const getLive = <K extends keyof PageLiveMap>(key: K) =>
  liveStore.get<PageLiveMap[K]>(key);
