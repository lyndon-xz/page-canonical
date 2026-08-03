import { useState } from "react";
import { createContainer } from "unstated-next";

import { FetchStatus } from "@/lib/fetch-status";

import { PageStore } from "../../store";

function useSearchBarModelHook() {
  /** 用户编辑中、尚未提交的筛选条件（已提交的在页面 store 的 appliedFilters） */
  const [cabinDraft, setCabinDraft] = useState("");

  const { flights, flightsStatus } = PageStore.useContainer();

  return {
    cabinDraft,
    setCabinDraft,
    resultCount: flights.length,
    isLoading: flightsStatus === FetchStatus.Loading,
  };
}

export const SearchBarModel = createContainer(useSearchBarModelHook);
