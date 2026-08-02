import { useCallback } from "react";

import {
  fetchListings,
  submitInquiry as submitInquiryService,
} from "./services";
import type { InquiryForm, ListingFilters } from "./shared/types";
import { PageStore } from "./store";

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

  // 被 usePageEffects 的 useEffect 依赖，需要稳定引用
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

  // 记下 error 后仍要 rethrow：调用方 action 需要拿到原错误把字段级错误回填到表单
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
