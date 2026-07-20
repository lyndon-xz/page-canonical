import { useState } from "react";
import { createContainer } from "unstated-next";

import type { Listing, ListingFilters } from "./shared/types";

const DEFAULT_FILTERS: ListingFilters = { keyword: "", roomType: "" };

/**
 * 全局 store：unstated-next 下用 createContainer 包裹自定义 hook。
 * 只放可序列化状态 + 原子 setter，无业务逻辑。
 * 活对象（询价表单实例）不进此处，登记在 liveStore（见 live.ts）；
 * 但表单的提交态（isSubmittingInquiry / inquiryError / inquirySubmitted）是可序列化派生态，本就该放 store。
 */
function usePageStoreHook() {
  // --- 房源列表（结构化状态，listing-list 模块属主写、其它模块只读派生） ---
  const [listingList, setListingList] = useState<Listing[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<Error | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );
  const [appliedFilters, setAppliedFilters] =
    useState<ListingFilters>(DEFAULT_FILTERS);

  // --- 询价提交态（由全局 submitInquiry action 写，inquiry-submit 模块只读派生） ---
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState<Error | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  return {
    listingList,
    setListingList,
    isLoadingList,
    setIsLoadingList,
    listError,
    setListError,
    selectedListingId,
    setSelectedListingId,
    appliedFilters,
    setAppliedFilters,
    isSubmittingInquiry,
    setIsSubmittingInquiry,
    inquiryError,
    setInquiryError,
    inquirySubmitted,
    setInquirySubmitted,
  };
}

export const PageStore = createContainer(usePageStoreHook);
