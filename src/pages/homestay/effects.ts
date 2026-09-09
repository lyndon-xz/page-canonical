import { useLayoutEffect } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import { pageActions } from "./actions";
import { parseFilters } from "./shared/filters";
import { resetResultSet, setListingsStatus } from "./slice";
import { store } from "./store";

const { loadListings } = pageActions;

export function usePageEffects() {
  useLayoutEffect(() => {
    store.dispatch(resetResultSet());
    store.dispatch(setListingsStatus(FetchStatus.Loading));
    void loadListings(parseFilters(window.location.search));
  }, []);
}
