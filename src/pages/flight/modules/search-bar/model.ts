import { useState } from "react";
import { createContainer } from "unstated-next";

import { FetchStatus } from "@/lib/fetch-status";

import { PageStore } from "../../store";

function useSearchBarModelHook() {
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
