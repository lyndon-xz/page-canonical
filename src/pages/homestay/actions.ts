import { useCallback } from "react";

import {
  fetchListings,
  submitInquiry as submitInquiryService,
} from "./services";
import type { InquiryForm, ListingFilters } from "./shared/types";
import { PageStore } from "./store";

/**
 * 全局 actions：unstated-next 下是 hook（需消费 Container）。
 * 按需稳定引用（R6.9）：被 effects 依赖的 loadListings 用 useCallback；
 * 只在事件里调用的 submitInquiry 保持普通函数。deps 里的 setter 跨渲染稳定。
 */
export function usePageActions() {
  const {
    setListingList,
    setIsLoadingList,
    setListError,
    setAppliedFilters,
    setIsSubmittingInquiry,
    setInquiryError,
    setInquirySubmitted,
  } = PageStore.useContainer();

  // loadListings 被 usePageEffects 的 useEffect 依赖 → 需稳定引用，用 useCallback
  const loadListings = useCallback(
    async (filters: ListingFilters) => {
      setAppliedFilters(filters);
      setIsLoadingList(true);
      setListError(null);
      try {
        const list = await fetchListings(filters);
        setListingList(list);
      } catch (err) {
        setListError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoadingList(false);
      }
    },
    [setAppliedFilters, setIsLoadingList, setListError, setListingList],
  );

  // submitInquiry 只在提交事件里被 module action 调用、不作依赖 → 普通函数即可。
  // 置提交态、调 service；成功置 inquirySubmitted；失败写 error 并 rethrow，
  // 让 inquiry-submit 的 module action 捕获后经 getLive 回填字段错误（编排在 action，不进 UI）。
  const submitInquiry = async (values: InquiryForm) => {
    setIsSubmittingInquiry(true);
    setInquiryError(null);
    setInquirySubmitted(false);
    try {
      await submitInquiryService(values);
      setInquirySubmitted(true);
    } catch (err) {
      setInquiryError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return { loadListings, submitInquiry };
}
