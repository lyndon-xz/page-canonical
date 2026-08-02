import { createSelector } from "@reduxjs/toolkit";

import type { Flight, SortBy } from "../../shared/types";
import { selectPageState, useAppSelector, type RootState } from "../../store";

const comparators: Record<SortBy, (a: Flight, b: Flight) => number> = {
  price: (a, b) => a.price - b.price,
  departTime: (a, b) => a.departTime.localeCompare(b.departTime),
};

const selectFlightResultsModel = createSelector(
  selectPageState,
  (state: RootState) => state.flightResults,
  (page, local) => {
    const { flightList, isLoadingList, selectedFlightId } = page;
    const { sortBy } = local;
    const sortedList = [...flightList].sort(comparators[sortBy]);
    return {
      sortedList,
      isLoading: isLoadingList,
      selectedFlightId,
      sortBy,
    };
  },
);

export function useFlightResultsModel() {
  return useAppSelector(selectFlightResultsModel);
}
