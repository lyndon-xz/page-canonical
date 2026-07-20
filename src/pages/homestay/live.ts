import type { UseFormReturn } from "react-hook-form";

import { liveStore } from "@/lib/live";

import type { InquiryForm } from "./shared/types";

/**
 * 活对象登记表：key → 类型（一眼看清本页面有哪些活对象）。
 * inquiryForm：询价表单的 useForm 实例，跨表单两模块经 FormProvider 响应式共享，
 * 同时登记进 liveStore 供 action 命令式回写（reset / setError），不进 store 的可序列化 state。
 */
export interface PageLiveMap {
  inquiryForm: UseFormReturn<InquiryForm>;
}

/** 类型安全读取：key 受 PageLiveMap 约束，返回类型自动推断 */
export const getLive = <K extends keyof PageLiveMap>(key: K) =>
  liveStore.get<PageLiveMap[K]>(key);
