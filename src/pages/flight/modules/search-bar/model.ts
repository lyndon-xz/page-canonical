import { createSelector } from "@reduxjs/toolkit";

import { selectPageState, useAppSelector, type RootState } from "../../store";

const selectSearchBarModel = createSelector(
  selectPageState,
  (state: RootState) => state.searchBar,
  (page, local) => {
    const { flightList, isLoadingList } = page;
    const { cabinDraft } = local;
    return {
      cabinDraft,
      resultCount: flightList.length,
      isLoading: isLoadingList,
    };
  },
);

export function useSearchBarModel() {
  return useAppSelector(selectSearchBarModel);
}
