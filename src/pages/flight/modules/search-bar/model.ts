import { useState } from "react";
import { createContainer } from "unstated-next";

import { PageStore } from "../../store";

function useSearchBarModelHook() {
  /** 用户编辑中、尚未提交的筛选条件（已提交的在页面 store） */
  const [cabinDraft, setCabinDraft] = useState("");

  const { flights, isLoadingFlights } = PageStore.useContainer();

  return {
    cabinDraft,
    setCabinDraft,
    resultCount: flights.length,
    isLoading: isLoadingFlights,
  };
}

export const SearchBarModel = createContainer(useSearchBarModelHook);
